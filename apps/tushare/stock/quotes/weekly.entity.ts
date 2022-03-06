import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class Weekly {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: '股票代码' })
  ts_code: string;
  @Index()
  @Column({ type: 'varchar', nullable: true, comment: '交易日期' })
  trade_date: string;
  @Column({ type: 'float', nullable: true, comment: '周收盘价' })
  close: number;
  @Column({ type: 'float', nullable: true, comment: '周开盘价' })
  open: number;
  @Column({ type: 'float', nullable: true, comment: '周最高价' })
  high: number;
  @Column({ type: 'float', nullable: true, comment: '周最低价' })
  low: number;
  @Column({ type: 'float', nullable: true, comment: '上一周收盘价' })
  pre_close: number;
  @Column({ type: 'float', nullable: true, comment: '周涨跌额' })
  change: number;
  @Column({ type: 'float', nullable: true, comment: '周涨跌幅' })
  pct_chg: number;
  @Column({ type: 'float', nullable: true, comment: '周成交量' })
  vol: number;
  @Column({ type: 'float', nullable: true, comment: '周成交额' })
  amount: number;
}
