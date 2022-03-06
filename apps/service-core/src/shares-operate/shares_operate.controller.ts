import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ResponseData } from '../aop/result';
import LimitStockOperate from './stock/limit.stock_operate';

@Controller('operate')
@ApiTags('操作')
export default class SharesOperateController {
  constructor(private readonly limitStockOperate: LimitStockOperate) {}

  @ApiQuery({ name: 'date', required: true })
  @ApiOperation({
    description: '一天持有战法',
  })
  @Get('limit_stock_operate')
  async limit(
    @Query('ts_codes') ts_codes: string | string[],
    @Query('date') date: string,
  ): Promise<ResponseData> {
    // swagger只输入一个时，类型为string
    if (typeof ts_codes === 'string') {
      ts_codes = [ts_codes];
    }
    const data = await this.limitStockOperate.start(ts_codes, date);
    return {
      code: 0,
      data,
    };
  }
}
