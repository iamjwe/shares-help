import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class ThsIndex {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: '代码' })
  ts_code: string;
  @Column({ type: 'varchar', nullable: true, comment: '名称' })
  name: string;
  @Column({ type: 'float', nullable: true, comment: '成分个数' })
  count: number;
  @Column({ type: 'varchar', nullable: true, comment: '交易所' })
  exchange: string;
  @Column({ type: 'varchar', nullable: true, comment: '上市日期' })
  list_date: string;
  @Column({ type: 'varchar', nullable: true, comment: 'N概念指数S特色指数' })
  type: string;
}
