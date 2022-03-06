import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class ThsMember {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: '指数代码' })
  ts_code: string;
  @Column({ type: 'varchar', nullable: true, comment: '股票代码' })
  code: string;
  @Column({ type: 'varchar', nullable: true, comment: '股票名称' })
  name: string;
  @Column({ type: 'float', nullable: true, comment: '权重' })
  weight: number;
  @Column({ type: 'varchar', nullable: true, comment: '纳入日期' })
  in_date: string;
  @Column({ type: 'varchar', nullable: true, comment: '剔除日期' })
  out_date: string;
  @Column({ type: 'varchar', nullable: true, comment: '是否最新Y是N否' })
  is_new: string;
}
