import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";

export default class Item extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public user_id: number;

  @column()
  public is_folder: boolean;

  @column()
  public is_public: boolean;

  @column()
  public is_favorite: boolean;

  @column()
  public folder_id: number | null;

  @column()
  public name: string;

  @column()
  public file: string | null;

  @column()
  public public_hash: string | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
