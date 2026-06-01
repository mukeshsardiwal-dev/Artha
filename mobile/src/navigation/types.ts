// Typed param-lists for every navigator in the app

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppTabsParamList = {
  Dashboard: undefined;
  Sales: undefined;
  Purchases: undefined;
  Parties: undefined;
  More: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  AddSale: undefined;
};

export type PurchasesStackParamList = {
  PurchasesList: undefined;
  AddPurchase: undefined;
};

export type PartiesStackParamList = {
  PartiesList: undefined;
  AddParty: undefined;
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Items: undefined;
  AddItem: undefined;
  Cashbook: undefined;
  Reports: undefined;
  Settings: undefined;
};