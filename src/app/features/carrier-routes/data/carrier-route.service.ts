import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CarrierRoute,
  CreateCarrierRouteDto,
  SuggestedRequestsPage,
  SuggestedSort,
}  from '../routes.model';
import { appConfig } from '../../../core/config/app-config';

export interface SuggestedQuery {
  routeId?: string | null;
  fittingOnly?: boolean;
  sort?: SuggestedSort;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class CarrierRouteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${appConfig.apiBaseUrl}/routes`;

  getMyRoutes(): Observable<CarrierRoute[]> {
    return this.http.get<CarrierRoute[]>(this.url);
  }

  addRoute(dto: CreateCarrierRouteDto): Observable<CarrierRoute> {
    return this.http.post<CarrierRoute>(this.url, dto);
  }

  deleteRoute(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getSuggestedRequests(query: SuggestedQuery = {}): Observable<SuggestedRequestsPage> {
    let params = new HttpParams()
      .set('page', query.page ?? 1)
      .set('pageSize', query.pageSize ?? 4);

    if (query.routeId) {
      params = params.set('routeId', query.routeId);
    }
    if (query.fittingOnly) {
      params = params.set('fittingOnly', true);
    }
    if (query.sort) {
      params = params.set('sort', query.sort);
    }

    return this.http.get<SuggestedRequestsPage>(`${this.url}/suggested-requests`, { params });
  }
}
