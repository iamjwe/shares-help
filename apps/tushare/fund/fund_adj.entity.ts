import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class FundAdj {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: 'ts基金代码' })
  ts_code: string;
  @Index()
  @Column({ type: 'varchar', nullable: true, comment: '交易日期' })
  trade_date: string;
  @Column({ type: 'float', nullable: true, comment: '复权因子' })
  adj_factor: number;
}
