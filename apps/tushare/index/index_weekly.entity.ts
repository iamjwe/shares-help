import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class IndexWeekly {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: 'TS指数代码' })
  ts_code: string;
  @Index()
  @Column({ type: 'varchar', nullable: true, comment: '交易日' })
  trade_date: string;
  @Column({ type: 'float', nullable: true, comment: '收盘点位' })
  close: number;
  @Column({ type: 'float', nullable: true, comment: '开盘点位' })
  open: number;
  @Column({ type: 'float', nullable: true, comment: '最高点位' })
  high: number;
  @Column({ type: 'float', nullable: true, comment: '最低点位' })
  low: number;
  @Column({ type: 'float', nullable: true, comment: '昨日收盘点' })
  pre_close: number;
  @Column({ type: 'float', nullable: true, comment: '涨跌点位' })
  change: number;
  @Column({ type: 'float', nullable: true, comment: '涨跌幅' })
  pct_chg: number;
  @Column({ type: 'float', nullable: true, comment: '成交量' })
  vol: number;
  @Column({ type: 'float', nullable: true, comment: '成交额' })
  amount: number;
}
