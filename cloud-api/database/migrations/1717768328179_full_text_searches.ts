import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'items';
  protected columnName = 'text';
  protected indexName = 'full_text_search_index';

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.text(this.columnName);
    });
    this.schema.raw(`CREATE INDEX ${this.indexName} ON ${this.tableName} USING GIN(to_tsvector('russian', ${this.columnName}))`);
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn(this.columnName);
      table.dropIndex(this.columnName, this.indexName);
    });
  }
}
