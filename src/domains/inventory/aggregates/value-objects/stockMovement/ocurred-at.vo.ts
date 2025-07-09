import { z } from 'zod';

const ocurredAtSchema = z.date();

export class OcurredAt {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  public static create(value: Date): OcurredAt {
    const validatedValue = ocurredAtSchema.parse(value);
    return new OcurredAt(validatedValue);
  }

  public static createNow(): OcurredAt {
    return new OcurredAt(new Date());
  }

  public getValue(): Date {
    return this.value;
  }

  public equals(otherOcurredAt: OcurredAt): boolean {
    return this.value.getTime() === otherOcurredAt.value.getTime();
  }

  public isInPast(): boolean {
    return this.value < new Date();
  }

  public isInFuture(): boolean {
    return this.value > new Date();
  }

  public isToday(): boolean {
    const today = new Date();
    return this.value.toDateString() === today.toDateString();
  }

  public isYesterday(): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.value.toDateString() === yesterday.toDateString();
  }

  public isThisWeek(): boolean {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return this.value >= startOfWeek && this.value <= endOfWeek;
  }

  public isThisMonth(): boolean {
    const now = new Date();
    return this.value.getMonth() === now.getMonth() && 
           this.value.getFullYear() === now.getFullYear();
  }

  public getTimeAgo(): string {
    const now = new Date();
    const diffInMs = now.getTime() - this.value.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return this.value.toLocaleDateString();
  }
} 