/**
 * database.schemas.ts 파일 자동 수정 스크립트
 *
 * 목적:
 *   - 생성된 database.schemas.ts 파일의 generic jsonSchema를 구체적 스키마로 변경
 *
 * 사용법:
 *   tsx src/shared/types/fix-database-schemas.ts
 *
 * 설정은 아래 SCHEMA_CONFIG 객체에서 수정
 */

import * as fs from "fs";
import * as path from "path";

const SCHEMAS_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "shared",
  "types",
  "database.schemas.ts",
);

// 스키마 수정 설정
const SCHEMA_CONFIG = [
  {
    tableName: "hk_admin_activity_logs",
    columns: [
      {
        name: "new_values",
        schemaName: "adminActivityLogValuesSchema",
        typeName: "AdminActivityLogValues",
      },
      {
        name: "old_values",
        schemaName: "adminActivityLogValuesSchema",
        typeName: "AdminActivityLogValues",
      },
    ],
  },
  {
    tableName: "hk_admin_users",
    columns: [
      {
        name: "permissions",
        schemaName: "adminPermissionsSchema",
        typeName: "AdminPermissions",
      },
    ],
  },
  {
    tableName: "hk_order_items",
    columns: [
      {
        name: "option_details",
        schemaName: "orderItemOptionDetailsSchema",
        typeName: "OrderItemOptionDetails",
      },
    ],
  },
  {
    tableName: "hk_payments",
    columns: [
      {
        name: "payment_details",
        schemaName: "paymentDetailsSchema",
        typeName: "PaymentDetails",
      },
    ],
  },
  {
    tableName: "hk_product_variants",
    columns: [
      {
        name: "option_combinations",
        schemaName: "productOptionCombinationsSchema",
        typeName: "ProductOptionCombinations",
      },
    ],
  },
  {
    tableName: "hk_products",
    columns: [
      {
        name: "dimensions",
        schemaName: "productDimensionsSchema",
        typeName: "ProductDimensions",
      },
    ],
  },
  {
    tableName: "hk_search_logs",
    columns: [
      {
        name: "search_filters",
        schemaName: "searchFiltersSchema",
        typeName: "SearchFilters",
      },
    ],
  },
  {
    tableName: "vw_hk_products_summary",
    columns: [
      {
        name: "dimensions",
        schemaName: "productDimensionsSchema",
        typeName: "ProductDimensions",
      },
    ],
  },
];

/**
 * import 구문 분석 및 업데이트
 */
function updateImportsForSchemas(content: string): string {
  const importTypes = new Set<string>();
  const importSchemas = new Set<string>();

  // 필요한 타입과 스키마 수집
  SCHEMA_CONFIG.forEach((table) => {
    table.columns.forEach((column) => {
      importTypes.add(column.typeName);
      importSchemas.add(column.schemaName);
    });
  });

  let modifiedContent = content;

  // database-json.schemas import 추가
  const schemasImportRegex =
    /import\s*\{\s*([^}]+)\s*\}\s*from\s*[\"']\.\/database-json\.schemas[\"']?/;
  const schemasMatch = modifiedContent.match(schemasImportRegex);
  console.log("🚀 ~ updateImportsForSchemas ~ schemasMatch:", schemasMatch);

  const newSchemasImport = `import {\n  ${Array.from(importSchemas).join(",\n  ")}\n} from "./database-json.schemas";\n`;

  if (schemasMatch) {
    // 기존 import 업데이트
    const existingSchemas = schemasMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const allSchemas = [
      ...new Set([...existingSchemas, ...Array.from(importSchemas)]),
    ];

    modifiedContent = modifiedContent.replace(
      schemasImportRegex,
      `import {\n  ${allSchemas.join(",\n  ")}\n} from "./database-json.schemas";`,
    );
  } else {
    // 새로운 import 추가
    const firstImportMatch = modifiedContent.match(/^import\s/m);
    if (firstImportMatch) {
      const insertIndex = modifiedContent.indexOf(firstImportMatch[0]);
      modifiedContent =
        modifiedContent.slice(0, insertIndex) +
        newSchemasImport +
        modifiedContent.slice(insertIndex);
    } else {
      // import 구문이 없으면 파일 맨 앞에 추가
      modifiedContent = newSchemasImport + modifiedContent;
    }
  }

  return modifiedContent;
}

/**
 * jsonSchema를 구체적 스키마로 교체
 */
function replaceJsonSchemas(content: string): string {
  let modifiedContent = content;

  SCHEMA_CONFIG.forEach((table) => {
    table.columns.forEach((column) => {
      // 다양한 패턴으로 jsonSchema 교체
      const patterns = [
        // columnName: jsonSchema.nullable()
        new RegExp(
          `(\\s+${column.name}\\s*:\\s*)jsonSchema(\\.nullable\\(\\))`,
          "g",
        ),
        // columnName: jsonSchema.optional().nullable()
        new RegExp(
          `(\\s+${column.name}\\s*:\\s*)jsonSchema(\\.optional\\(\\)\\.nullable\\(\\))`,
          "g",
        ),
        // jsonSchema.optional()
        new RegExp(
          `(\\s+${column.name}\\s*:\\s*)jsonSchema(\\.optional\\(\\))`,
          "g",
        ),
        // columnName: jsonSchema,
        new RegExp(`(\\s+${column.name}\\s*:\\s*)jsonSchema(,)`, "g"),
        // columnName: jsonSchema
        new RegExp(`(\\s+${column.name}\\s*:\\s*)jsonSchema(?=[\\s,}])`, "g"),
      ];

      patterns.forEach((pattern) => {
        modifiedContent = modifiedContent.replace(
          pattern,
          `$1${column.schemaName}$2`,
        );
      });
    });
  });

  return modifiedContent;
}

/**
 * 기존 구체적 스키마 정의 제거 (중복 방지)
 */
function removeExistingSchemaDefinitions(content: string): string {
  let modifiedContent = content;

  // 기존 스키마 정의 제거
  const schemaDefinitionRegex =
    /\/\/ 구체적인 JSON 타입별 Zod 스키마[\s\S]*?(?=export const hk|$)/;
  modifiedContent = modifiedContent.replace(schemaDefinitionRegex, "");

  return modifiedContent;
}

/**
 * generic jsonSchema 정의 제거
 */
function removeGenericJsonSchema(content: string): string {
  let modifiedContent = content;

  // export const jsonSchema: z.ZodSchema<Json> = z.lazy(() => ... ); 패턴 제거
  const jsonSchemaRegex =
    /export\s+const\s+jsonSchema\s*:\s*z\.ZodSchema<Json>\s*=\s*z\.lazy\(\(\)\s*=>\s*z\s*\.union\(\[\s*z\.string\(\),\s*z\.number\(\),\s*z\.boolean\(\),\s*z\.record\(z\.union\(\[jsonSchema,\s*z\.undefined\(\)\]\)\),\s*z\.array\(jsonSchema\),\s*\]\)\s*\.nullable\(\),\s*\);\s*/g;

  modifiedContent = modifiedContent.replace(jsonSchemaRegex, "");

  // 더 유연한 패턴으로 제거 (멀티라인 고려)
  const flexibleJsonSchemaRegex =
    /export\s+const\s+jsonSchema[\s\S]*?\.nullable\(\),?\s*\);\s*/g;
  modifiedContent = modifiedContent.replace(flexibleJsonSchemaRegex, "");

  return modifiedContent;
}

/**
 * Json 타입 import 제거 (더 이상 사용되지 않으므로)
 */
function removeJsonTypeImport(content: string): string {
  let modifiedContent = content;

  // import { Json } from "./database.types"; 제거
  const jsonImportRegex =
    /import\s*\{\s*Json\s*\}\s*from\s*[\"']\.\/database\.types[\"'];\s*/g;
  modifiedContent = modifiedContent.replace(jsonImportRegex, "");

  return modifiedContent;
}

/**
 * 메인 수정 함수
 */
function fixDatabaseSchemas(): void {
  console.log("📝 database.schemas.ts 파일 수정 시작...");

  // 1. 파일 읽기
  if (!fs.existsSync(SCHEMAS_FILE_PATH)) {
    console.error("❌ database.schemas.ts 파일이 존재하지 않습니다.");
    process.exit(1);
  }

  let content = fs.readFileSync(SCHEMAS_FILE_PATH, "utf-8");

  // 2. 기존 스키마 정의 제거
  console.log("🗑️ 기존 인라인 스키마 정의 제거 중...");
  content = removeExistingSchemaDefinitions(content);

  // 3. import 구문 업데이트
  console.log("📦 import 구문 업데이트 중...");
  content = updateImportsForSchemas(content);

  // 4. jsonSchema를 구체적 스키마로 교체
  console.log("🔄 jsonSchema를 구체적 스키마로 교체 중...");
  content = replaceJsonSchemas(content);

  // 5. generic jsonSchema 정의 제거
  console.log("🗑️ generic jsonSchema 정의 제거 중...");
  content = removeGenericJsonSchema(content);

  // 6. Json 타입 import 제거
  console.log("🗑️ Json 타입 import 제거 중...");
  content = removeJsonTypeImport(content);

  // 7. 파일 저장
  fs.writeFileSync(SCHEMAS_FILE_PATH, content, "utf-8");

  console.log("✅ database.schemas.ts 파일 수정 완료!");

  // 8. 수정 결과 로그
  console.log("\n📋 적용된 스키마 매핑:");
  SCHEMA_CONFIG.forEach((table) => {
    table.columns.forEach((column) => {
      console.log(
        `  - ${table.tableName}.${column.name}: jsonSchema → ${column.schemaName}`,
      );
    });
  });
}

// 실행
try {
  fixDatabaseSchemas();
} catch (error) {
  console.error("❌ 스키마 파일 수정 실패:", error);
  process.exit(1);
}
