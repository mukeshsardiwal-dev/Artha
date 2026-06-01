import { apiRequest } from './client';
import { CashbookBalance, CashbookEntry, Item, Party, Transaction } from './types';

export function getPartiesRequest(token: string) {
  return apiRequest<Party[]>('/parties', {
    method: 'GET',
    token,
  });
}

export function getItemsRequest(token: string) {
  return apiRequest<Item[]>('/items', {
    method: 'GET',
    token,
  });
}

export function getSalesRequest(token: string) {
  return apiRequest<Transaction[]>('/transactions?type=sale', {
    method: 'GET',
    token,
  });
}

export function getPurchasesRequest(token: string) {
  return apiRequest<Transaction[]>('/transactions?type=purchase', {
    method: 'GET',
    token,
  });
}

export function getCashbookEntriesRequest(token: string) {
  return apiRequest<CashbookEntry[]>('/cashbook', {
    method: 'GET',
    token,
  });
}

export function getCashbookBalanceRequest(token: string) {
  return apiRequest<CashbookBalance>('/cashbook/balance', {
    method: 'GET',
    token,
  });
}