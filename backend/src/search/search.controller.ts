import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  CacheInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchEventsDto } from './dto/search-events.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('events')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Search events' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns search results' })
  async searchEvents(@Query() params: SearchEventsDto, @Request() req: any) {
    const results = await this.searchService.searchEvents(params);
    if (params.query) {
      await this.searchService.logSearch(params.query, req.user?.id);
    }
    return results;
  }

  @Get('suggestions')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns search suggestions' })
  async getSuggestions(@Query('query') query: string) {
    return this.searchService.getSuggestions(query);
  }

  @Get('popular')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get popular searches' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns popular searches' })
  async getPopularSearches() {
    return this.searchService.getPopularSearches();
  }
}