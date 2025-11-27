/**
 * Supabase 타입 파일 자동 수정 스크립트
 *
 * 목적:
 *   - 생성된 database.types.ts 파일의 JSONB 타입을 구체적 타입으로 변경
 *   - Nullable 필드를 Non-nullable로 변경 (뷰 테이블의 필수 필드)
 *   - 필요한 타입 import 구문 자동 추가
 *
 * 기능:
 *   1. JSONB 타입 치환: Json → 구체적인 타입명 (AdminPermissions, ProductDimensions 등)
 *   2. 뷰 테이블 필수 필드: nullable → non-nullable 변경
 *   3. Import 구문 관리: database-json.types에서 필요한 타입들 자동 import
 *
 * 사용법:
 *   tsx src/shared/types/fix-database-types.ts
 *
 * 설정은 아래 CONFIG 객체에서 수정
 */

import * as fs from "fs";
import * as path from "path";

const TYPES_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "shared",
  "types",
  "database.types.ts",
);

/**
 * 테이블별 타입 수정 설정 인터페이스
 */
interface TableConfig {
  /** 대상 테이블명 */
  tableName: string;
  /** JSONB 타입을 치환할 컬럼들 */
  columns: {
    /** 컬럼명 */
    name: string;
    /** 치환할 타입명 */
    type: string;
    /** 타입을 import할 모듈 경로 */
    importFrom: string;
  }[];
  /** nullable을 non-nullable로 변경할 필드들 (주로 뷰 테이블용) */
  nullableToNonNullable?: string[];
  /** 적용할 operation 타입 (Row, Insert, Update) */
  operations: string[];
}

/**
 * 타입 수정 설정
 * 
 * 새로운 JSONB 타입이나 뷰 테이블이 추가되면 여기에 설정을 추가
 */
const CONFIG: TableConfig[] = [
  {
    tableName: "hk_admin_activity_logs",
    columns: [
      {
        name: "new_values",
        type: "AdminActivityLogValues",
        importFrom: "./database-json.types",
      },
      {
        name: "old_values",
        type: "AdminActivityLogValues",
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
  {
    tableName: "hk_admin_users",
    columns: [
      {
        name: "permissions",
        type: "AdminPermissions",
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
  {
    tableName: "hk_order_items",
    columns: [
      {
        name: "option_details",
        type: "OrderItemOptionDetails",
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
  {
    tableName: "hk_payments",
    columns: [
      {
        name: "payment_details",
        type: "PaymentDetails",
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
  {
    tableName: "hk_product_variants",
    columns: [
      {
        name: "option_combinations",
        type: "ProductOptionCombinations",
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
  {
    tableName: "hk_products",
    columns: [
      {
        name: "dimensions",
        type: "ProductDimensions",
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
  {
    tableName: "hk_search_logs",
    columns: [
      {
        name: "search_filters",
        type: "SearchFilters",
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
  {
    tableName: "vw_hk_products_summary",
    columns: [
      {
        name: "dimensions",
        type: "ProductDimensions",
        importFrom: "./database-json.types",
      },
    ],
    nullableToNonNullable: [
      "id",
      "name",
      "slug",
      "sku",
      "base_price",
      "category_id",
      "is_featured",
      "is_new",
      "is_bestseller",
      "is_active",
    ],
    operations: ["Row"],
  },
];

/**
 * import 구문 분석
 */
function parseImports(content: string): Map<string, Set<string>> {
  const importMap = new Map<string, Set<string>>();

  // import { type1, type2 } from "./module" 형태 매칭
  const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*["']([^"']+)["']/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const types = match[1].split(",").map((t) => t.trim());
    const module = match[2];

    if (!importMap.has(module)) {
      importMap.set(module, new Set());
    }

    types.forEach((type) => importMap.get(module)!.add(type));
  }

  return importMap;
}

/**
 * import 구문 추가/업데이트
 */
function updateImports(
  content: string,
  columns: { name: string; type: string; importFrom?: string }[],
): string {
  const existingImports = parseImports(content);

  // 필요한 import 수집
  const requiredImports = new Map<string, Set<string>>();
  columns.forEach((column) => {
    if (column.importFrom) {
      if (!requiredImports.has(column.importFrom)) {
        requiredImports.set(column.importFrom, new Set());
      }
      requiredImports.get(column.importFrom)!.add(column.type);
    }
  });

  let modifiedContent = content;

  // 각 모듈별로 import 처리
  for (const [module, newTypes] of requiredImports) {
    const existingTypes = existingImports.get(module) || new Set();

    // 새로 추가해야 할 타입들
    const typesToAdd = [...newTypes].filter((type) => !existingTypes.has(type));

    if (typesToAdd.length > 0) {
      if (existingTypes.size > 0) {
        // 기존 import 구문에 추가
        const importRegex = new RegExp(
          `(import\\s*\\{\\s*)([^}]+)(\\s*\\}\\s*from\\s*["']${module.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          )}["'])`,
        );

        modifiedContent = modifiedContent.replace(
          importRegex,
          (match, prefix, existingTypesStr, suffix) => {
            const allTypes = [
              ...existingTypesStr.split(",").map((t: string) => t.trim()),
              ...typesToAdd,
            ];
            return `${prefix}${allTypes.join(", ")}${suffix}`;
          },
        );
      } else {
        // 새로운 import 구문 추가
        const newImport = `import { ${typesToAdd.join(
          ", ",
        )} } from "${module}";\r\n`;

        // 첫 번째 import 구문 앞에 추가
        const firstImportMatch = modifiedContent.match(/^import\s/m);
        if (firstImportMatch) {
          const insertIndex = modifiedContent.indexOf(firstImportMatch[0]);
          modifiedContent =
            modifiedContent.slice(0, insertIndex) +
            newImport +
            modifiedContent.slice(insertIndex);
        } else {
          // import 구문이 없으면 파일 맨 앞에 추가
          modifiedContent = newImport + modifiedContent;
        }
      }
    }
  }

  return modifiedContent;
}

/**
 * Nullable을 Non-nullable로 변경
 */
function fixNullableToNonNullable(
  content: string,
  tableName: string,
  fieldNames: string[],
  operations: string[],
): string {
  let modifiedContent = content;

  for (const operation of operations) {
    for (const fieldName of fieldNames) {
      // fieldName: Type | null → fieldName: Type 형태로 변경
      const nullablePattern = new RegExp(
        `(\\s+${fieldName}\\s*:\\s*)([^\\s|]+)(\\s*\\|\\s*null)`,
        "g",
      );
      modifiedContent = modifiedContent.replace(nullablePattern, "$1$2");
    }
  }

  return modifiedContent;
}

/**
 * 테이블 타입 수정
 */
function fixTableTypes(
  content: string,
  tableName: string,
  columns: { name: string; type: string; importFrom?: string }[] = [],
  operations: string[],
): string {
  let modifiedContent = content;

  for (const operation of operations) {
    for (const column of columns) {
      // Row 타입: columnName: Json | null → columnName: TypeName | null
      if (operation === "Row") {
        const rowPattern = new RegExp(
          `(\\s+${column.name}\\s*:\\s*)Json(\\s*\\|?\\s*null)?`,
          "g",
        );
        modifiedContent = modifiedContent.replace(
          rowPattern,
          `$1${column.type}$2`,
        );
      }

      // Insert 타입: columnName?: Json | null → columnName?: TypeName | null
      if (operation === "Insert") {
        const insertPattern = new RegExp(
          `(\\s+${column.name}\\?\\s*:\\s*)Json(\\s*\\|?\\s*null)?`,
          "g",
        );
        modifiedContent = modifiedContent.replace(
          insertPattern,
          `$1${column.type}$2`,
        );
      }

      // Update 타입: columnName?: Json | null → columnName?: TypeName | null
      if (operation === "Update") {
        const updatePattern = new RegExp(
          `(\\s+${column.name}\\?\\s*:\\s*)Json(\\s*\\|?\\s*null)?`,
          "g",
        );
        modifiedContent = modifiedContent.replace(
          updatePattern,
          `$1${column.type}$2`,
        );
      }

      // Json만 단독으로 있는 경우 처리 (null 없음)
      const standalonePattern = new RegExp(
        `(\\s+${column.name}\\??\\s*:\\s*)Json([,\\s}])`,
        "g",
      );
      modifiedContent = modifiedContent.replace(
        standalonePattern,
        `$1${column.type}$2`,
      );
    }
  }

  return modifiedContent;
}

/**
 * 메인 수정 함수
 */
function fixDatabaseTypes(): void {
  console.log("📝 database.types.ts 파일 수정 시작...");

  // 1. 파일 읽기
  if (!fs.existsSync(TYPES_FILE_PATH)) {
    console.error(
      "❌ src/shared/types/database.types.ts 파일이 존재하지 않습니다.",
    );
    process.exit(1);
  }

  let content = fs.readFileSync(TYPES_FILE_PATH, "utf-8");

  // 2. 필요한 import 구문 수집 및 추가
  const allColumns = CONFIG.flatMap((config) => config.columns);
  const columnsWithImports = allColumns.filter((col) => col.importFrom);

  if (columnsWithImports.length > 0) {
    console.log("📦 import 구문 업데이트 중...");
    content = updateImports(content, columnsWithImports);

    // import 결과 로그
    const importGroups = new Map<string, string[]>();
    columnsWithImports.forEach((col) => {
      if (col.importFrom) {
        if (!importGroups.has(col.importFrom)) {
          importGroups.set(col.importFrom, []);
        }
        if (!importGroups.get(col.importFrom)!.includes(col.type)) {
          importGroups.get(col.importFrom)!.push(col.type);
        }
      }
    });

    importGroups.forEach((types, module) => {
      console.log(`  📥 ${module}: ${types.join(", ")}`);
    });
  }

  // 3. 각 테이블별로 타입 수정
  for (const tableConfig of CONFIG) {
    const columnsInfo = tableConfig.columns
      ? `컬럼=${tableConfig.columns.map((c) => `${c.name}:${c.type}`).join(",")}`
      : "컬럼=없음";
    const nullableInfo = tableConfig.nullableToNonNullable
      ? `nullable제거=${tableConfig.nullableToNonNullable.join(",")}`
      : "nullable제거=없음";

    console.log(
      `📋 처리 중: 테이블=${tableConfig.tableName}, ${columnsInfo}, ${nullableInfo}, 작업=${tableConfig.operations.join(",")}`,
    );

    // JSONB 타입 수정
    if (tableConfig.columns && tableConfig.columns.length > 0) {
      content = fixTableTypes(
        content,
        tableConfig.tableName,
        tableConfig.columns,
        tableConfig.operations,
      );

      // 수정 결과 로그
      tableConfig.columns.forEach((column) => {
        console.log(
          `  - ${tableConfig.tableName}.${column.name}: Json → ${column.type}`,
        );
      });
    }

    // Nullable → Non-nullable 수정
    if (
      tableConfig.nullableToNonNullable &&
      tableConfig.nullableToNonNullable.length > 0
    ) {
      content = fixNullableToNonNullable(
        content,
        tableConfig.tableName,
        tableConfig.nullableToNonNullable,
        tableConfig.operations,
      );

      // 수정 결과 로그
      tableConfig.nullableToNonNullable.forEach((fieldName) => {
        console.log(
          `  - ${tableConfig.tableName}.${fieldName}: Type | null → Type`,
        );
      });
    }
  }

  // 4. 파일 저장
  fs.writeFileSync(TYPES_FILE_PATH, content, "utf-8");

  console.log("✅ database.types.ts 파일 수정 완료!");
}

// 실행
try {
  fixDatabaseTypes();
} catch (error) {
  console.error("❌ 타입 파일 수정 실패:", error);
  process.exit(1);
}
