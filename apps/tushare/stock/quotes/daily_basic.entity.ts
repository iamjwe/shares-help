import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class DailyBasic {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: 'TS股票代码' })
  ts_code: string;
  @Index()
  @Column({ type: 'varchar', nullable: true, comment: '交易日期' })
  trade_date: string;
  @Column({ type: 'float', nullable: true, comment: '当日收盘价' })
  close: number;
  @Column({ type: 'float', nullable: true, comment: '换手率（%）' })
  turnover_rate: number;
  @Column({ type: 'float', nullable: true, comment: '换手率（自由流通股）' })
  turnover_rate_f: number;
  @Column({ type: 'float', nullable: true, comment: '量比' })
  volume_ratio: number;
  @Column({
    type: 'float',
    nullable: true,
    comment: '市盈率（总市值/净利润， 亏损的PE为空）',
  })
  pe: number;
  @Column({
    type: 'float',
    nullable: true,
    comment: '市盈率（TTM，亏损的PE为空）',
  })
  pe_ttm: number;
  @Column({ type: 'float', nullable: true, comment: '市净率（总市值/净资产）' })
  pb: number;
  @Column({ type: 'float', nullable: true, comment: '市销率' })
  ps: number;
  @Column({ type: 'float', nullable: true, comment: '市销率（TTM）' })
  ps_ttm: number;
  @Column({ type: 'float', nullable: true, comment: '股息率 （%）' })
  dv_ratio: number;
  @Column({ type: 'float', nullable: true, comment: '股息率（TTM）（%）' })
  dv_ttm: number;
  @Column({ type: 'float', nullable: true, comment: '总股本 （万股）' })
  total_share: number;
  @Column({ type: 'float', nullable: true, comment: '流通股本 （万股）' })
  float_share: number;
  @Column({ type: 'float', nullable: true, comment: '自由流通股本 （万）' })
  free_share: number;
  @Column({ type: 'float', nullable: true, comment: '总市值 （万元）' })
  total_mv: number;
  @Column({ type: 'float', nullable: true, comment: '流通市值（万元）' })
  circ_mv: number;
}
