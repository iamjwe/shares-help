import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class Daily {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: 'TS代码' })
  ts_code: string;
  @Index()
  @Column({ type: 'varchar', nullable: true, comment: '交易日期' })
  trade_date: string;
  @Column({ type: 'float', nullable: true, comment: '开盘价(元)' })
  open: number;
  @Column({ type: 'float', nullable: true, comment: '最高价(元)' })
  high: number;
  @Column({ type: 'float', nullable: true, comment: '最低价(元)' })
  low: number;
  @Column({ type: 'float', nullable: true, comment: '收盘价(元)' })
  close: number;
  @Column({ type: 'float', nullable: true, comment: '昨收盘价(元)' })
  pre_close: number;
  @Column({ type: 'float', nullable: true, comment: '涨跌额(元)' })
  change: number;
  @Column({ type: 'float', nullable: true, comment: '涨跌幅(%)' })
  pct_chg: number;
  @Column({ type: 'float', nullable: true, comment: '成交量(手)' })
  vol: number;
  @Column({ type: 'float', nullable: true, comment: '成交额(千元)' })
  amount: number;
}
