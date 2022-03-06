import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class Monthly {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: '股票代码' })
  ts_code: string;
  @Index()
  @Column({ type: 'varchar', nullable: true, comment: '交易日期' })
  trade_date: string;
  @Column({ type: 'float', nullable: true, comment: '月收盘价' })
  close: number;
  @Column({ type: 'float', nullable: true, comment: '月开盘价' })
  open: number;
  @Column({ type: 'float', nullable: true, comment: '月最高价' })
  high: number;
  @Column({ type: 'float', nullable: true, comment: '月最低价' })
  low: number;
  @Column({ type: 'float', nullable: true, comment: '上月收盘价' })
  pre_close: number;
  @Column({ type: 'float', nullable: true, comment: '月涨跌额' })
  change: number;
  @Column({ type: 'float', nullable: true, comment: '月涨跌幅' })
  pct_chg: number;
  @Column({ type: 'float', nullable: true, comment: '月成交量' })
  vol: number;
  @Column({ type: 'float', nullable: true, comment: '月成交额' })
  amount: number;
}
