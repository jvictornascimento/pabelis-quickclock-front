export interface Company {id:number;name:string;active:boolean;createdAt:string;updatedAt:string}
export const weekdays = ['mondayActive','tuesdayActive','wednesdayActive','thursdayActive','fridayActive','saturdayActive','sundayActive'] as const;
export type Weekdays = Record<typeof weekdays[number], boolean>;
export interface CompanySettings {id:number;companyId:number;halfDayValueCents:number;weekdays:Weekdays;updatedAt:string}
