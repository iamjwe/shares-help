import IndexDaily from '@/tushare/index/index_daily.entity';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import BaseData from './base.data';
import BaseDataUtil from './base.util';
import { getIndexDaily } from '@/tushare/index/index_daily';

export const CACHE_KEY_INDEX_DATA_SYNC = {
  INDEX_DAILY_READY: 'index_daily_ready',
};
// 同步Tuhsare数据到数据库中
@Injectable()
export class IndexDataSync implements OnModuleInit {
  useMyDb: boolean;
  token: string;
  tradeCalBegin: string;
  constructor(
    @InjectRepository(IndexDaily)
    private indexDailyRepository: Repository<IndexDaily>,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
    @Inject(ConfigService) private readonly configServices: ConfigService,
    private readonly baseData: BaseData,
    private readonly baseDataUtil: BaseDataUtil,
  ) {
    const { useMyDb, token, tradeCalBegin } =
      this.configServices.get('tushare');
    this.token = token;
    this.tradeCalBegin = tradeCalBegin; // 获取量化日历和量化数据的开始日期
    this.useMyDb = useMyDb;
  }

  async onModuleInit() {
    if (this.useMyDb) {
      const index_daily_ready = await this.checkIndexDailyReady();
    }
  }

  // 指数行情通常不会循环获取，暂不做本地db缓存
  async checkIndexDailyReady(): Promise<boolean> {
    const index_daily_ready = false;
    await this.cacheManager.set(
      CACHE_KEY_INDEX_DATA_SYNC.INDEX_DAILY_READY,
      index_daily_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return index_daily_ready;
  }
}
