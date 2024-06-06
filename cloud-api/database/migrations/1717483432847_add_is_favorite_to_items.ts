import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  public async up() {
    this.schema.alterTable("items", (table) => {
      table.boolean("is_favorite").notNullable().defaultTo(false);
    });
  }
}
