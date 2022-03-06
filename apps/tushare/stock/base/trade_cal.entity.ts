import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class TradeCal {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Column({
    type: 'varchar',
    nullable: true,
    comment: '交易所 SSE上交所 SZSE深交所',
  })
  exchange: string;
  @Column({ type: 'varchar', unique: true, comment: '日历日期' })
  cal_date: string;
  @Column({ type: 'tinyint', nullable: true, comment: '是否交易 0休市 1交易' })
  is_open: number;
  @Column({ type: 'varchar', nullable: true, comment: '上一个交易日' })
  pretrade_date: string;
}
