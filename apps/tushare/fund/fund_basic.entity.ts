import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
@Entity()
export default class FundBasic {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: number;
  @Index()
  @Column({ type: 'varchar', width: 10, nullable: true, comment: '基金代码' })
  ts_code: string;
  @Column({ type: 'varchar', nullable: true, comment: '简称' })
  name: string;
  @Column({ type: 'varchar', nullable: true, comment: '管理人' })
  management: string;
  @Column({ type: 'varchar', nullable: true, comment: '托管人' })
  custodian: string;
  @Column({ type: 'varchar', nullable: true, comment: '投资类型' })
  fund_type: string;
  @Column({ type: 'varchar', nullable: true, comment: '成立日期' })
  found_date: string;
  @Column({ type: 'varchar', nullable: true, comment: '到期日期' })
  due_date: string;
  @Column({ type: 'varchar', nullable: true, comment: '上市时间' })
  list_date: string;
  @Column({ type: 'varchar', nullable: true, comment: '发行日期' })
  issue_date: string;
  @Column({ type: 'varchar', nullable: true, comment: '退市日期' })
  delist_date: string;
  @Column({ type: 'float', nullable: true, comment: '发行份额(亿)' })
  issue_amount: number;
  @Column({ type: 'float', nullable: true, comment: '管理费' })
  m_fee: number;
  @Column({ type: 'float', nullable: true, comment: '托管费' })
  c_fee: number;
  @Column({ type: 'float', nullable: true, comment: '存续期' })
  duration_year: number;
  @Column({ type: 'float', nullable: true, comment: '面值' })
  p_value: number;
  @Column({ type: 'float', nullable: true, comment: '起点金额(万元)' })
  min_amount: number;
  @Column({ type: 'float', nullable: true, comment: '预期收益率' })
  exp_return: number;
  @Column({ type: 'varchar', nullable: true, comment: '业绩比较基准' })
  benchmark: string;
  @Column({
    type: 'varchar',
    nullable: true,
    comment: '存续状态D摘牌 I发行 L已上市',
  })
  status: string;
  @Column({ type: 'varchar', nullable: true, comment: '投资风格' })
  invest_type: string;
  @Column({ type: 'varchar', nullable: true, comment: '基金类型' })
  type: string;
  @Column({ type: 'varchar', nullable: true, comment: '受托人' })
  trustee: string;
  @Column({ type: 'varchar', nullable: true, comment: '日常申购起始日' })
  purc_startdate: string;
  @Column({ type: 'varchar', nullable: true, comment: '日常赎回起始日' })
  redm_startdate: string;
  @Column({ type: 'varchar', nullable: true, comment: 'E场内O场外' })
  market: string;
}
