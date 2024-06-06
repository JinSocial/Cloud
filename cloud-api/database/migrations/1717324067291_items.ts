import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "items";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table.integer("user_id").notNullable();

      table.boolean("is_folder").notNullable();
      table.boolean("is_public").notNullable().defaultTo(false);
      table.integer("folder_id");

      table.string("name").notNullable();
      table.string("file");

      table.string("public_hash");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
