import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ResponseData } from '../aop/result';
import AmplitudeStockAnalysis from './stock/amplitude.stock_analysis';

@Controller('analysis')
@ApiTags('分析')
export default class SharesAnalysisController {
  constructor(
    private readonly amplitudeStockAnalysis: AmplitudeStockAnalysis,
  ) {}

  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'amplitude', required: true })
  @ApiOperation({
    description: '振幅分析',
  })
  @Get('amplitude_analysis')
  async amplitude_analysis(
    @Query('date') date: string,
    @Query('amplitude') amplitude: number,
  ): Promise<ResponseData> {
    const data = await this.amplitudeStockAnalysis.start(date, amplitude);
    return {
      code: 0,
      data,
    };
  }
}
