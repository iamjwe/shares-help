import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class StockBasic {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: 'TS代码' })
  ts_code: string;
  @Column({ type: 'varchar', nullable: true, comment: '股票代码' })
  symbol: string;
  @Column({ type: 'varchar', nullable: true, comment: '股票名称' })
  name: string;
  @Column({ type: 'varchar', nullable: true, comment: '地域' })
  area: string;
  @Column({ type: 'varchar', nullable: true, comment: '所属行业' })
  industry: string;
  @Column({ type: 'varchar', nullable: true, comment: '股票全称' })
  fullname: string;
  @Column({ type: 'varchar', nullable: true, comment: '英文全称' })
  enname: string;
  @Column({ type: 'varchar', nullable: true, comment: '拼音缩写' })
  cnspell: string;
  @Column({
    type: 'varchar',
    nullable: true,
    comment: '市场类型（主板/创业板/科创板/CDR）',
  })
  market: string;
  @Column({ type: 'varchar', nullable: true, comment: '交易所代码' })
  exchange: string;
  @Column({ type: 'varchar', nullable: true, comment: '交易货币' })
  curr_type: string;
  @Column({
    type: 'varchar',
    nullable: true,
    comment: '上市状态 L上市 D退市 P暂停上市',
  })
  list_status: string;
  @Column({ type: 'varchar', nullable: true, comment: '上市日期' })
  list_date: string;
  @Column({ type: 'varchar', nullable: true, comment: '退市日期' })
  delist_date: string;
  @Column({
    type: 'varchar',
    nullable: true,
    comment: '是否沪深港通标的，N否 H沪股通 S深股通',
  })
  is_hs: string;
}
