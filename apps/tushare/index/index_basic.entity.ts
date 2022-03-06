import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class IndexBasic {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: 'TS代码' })
  ts_code: string;
  @Column({ type: 'varchar', nullable: true, comment: '简称' })
  name: string;
  @Column({ type: 'varchar', nullable: true, comment: '指数全称' })
  fullname: string;
  @Column({ type: 'varchar', nullable: true, comment: '市场' })
  market: string;
  @Column({ type: 'varchar', nullable: true, comment: '发布方' })
  publisher: string;
  @Column({ type: 'varchar', nullable: true, comment: '指数风格' })
  index_type: string;
  @Column({ type: 'varchar', nullable: true, comment: '指数类别' })
  category: string;
  @Column({ type: 'varchar', nullable: true, comment: '基期' })
  base_date: string;
  @Column({ type: 'float', nullable: true, comment: '基点' })
  base_point: number;
  @Column({ type: 'varchar', nullable: true, comment: '发布日期' })
  list_date: string;
  @Column({ type: 'varchar', nullable: true, comment: '加权方式' })
  weight_rule: string;
  @Column({ type: 'varchar', nullable: true, comment: '描述' })
  desc: string;
  @Column({ type: 'varchar', nullable: true, comment: '终止日期' })
  exp_date: string;
}
