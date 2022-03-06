import TradeCal from '@/tushare/stock/base/trade_cal.entity';
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

export const CACHE_KEY_BASE_DATA_SYNC = {
  TRADECAL_READY: 'tradeCal_ready',
};

@Injectable()
export class BaseDataSync implements OnModuleInit {
  useMyDb: boolean;
  token: string;
  tradeCalBegin: string;
  constructor(
    @InjectRepository(TradeCal)
    private tradeCalRepository: Repository<TradeCal>,
    @Inject(ConfigService) private readonly configServices: ConfigService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
  ) {
    const { useMyDb, token, tradeCalBegin } =
      this.configServices.get('tushare');
    this.token = token;
    this.tradeCalBegin = tradeCalBegin; // 获取量化日历和量化数据的开始日期
    this.useMyDb = useMyDb;
  }

  async onModuleInit() {
    if (this.useMyDb) {
      const tradeCal_ready = await this.checkTradeCalReady();
    }
  }

  async checkTradeCalReady(): Promise<boolean> {
    const tradeCal_ready = false;
    await this.cacheManager.set(
      CACHE_KEY_BASE_DATA_SYNC.TRADECAL_READY,
      tradeCal_ready,
      {
        ttl: 0,
      },
    );
    return tradeCal_ready;
  }
}
