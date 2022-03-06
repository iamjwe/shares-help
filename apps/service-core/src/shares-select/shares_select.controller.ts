import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ResponseData } from '../aop/result';
import LimitStockSelect from './stock/limit.stock_select';
import LimitThsSelect from './ths/limit.ths_select';

@Controller('select')
@ApiTags('选股')
export default class SharesSelectController {
  constructor(
    private readonly limitThsSelect: LimitThsSelect,
    private readonly limitStockSelect: LimitStockSelect,
  ) {}

  @ApiQuery({ name: 'date', required: true })
  @ApiOperation({
    description: '龙头板块',
  })
  @Get('limit_select_ths')
  async limit_ths(@Query('date') date: string): Promise<ResponseData> {
    const data = await this.limitThsSelect.start(date);
    return {
      code: 0,
      data,
    };
  }

  @ApiQuery({ name: 'date', required: true })
  @ApiOperation({
    description: '龙头股票',
  })
  @Get('limit_select_stock')
  async limit_stock(@Query('date') date: string): Promise<ResponseData> {
    const data = await this.limitStockSelect.start(date);
    return {
      code: 0,
      data,
    };
  }
}
