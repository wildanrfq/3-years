export interface ElapsedDuration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

export interface MilestoneStatus {
  days: number;
  label: string;
  reached: boolean;
  dateLabel: string;
}

const DAY_MS = 86_400_000;

export function getElapsedSince(startIso: string, now: Date): ElapsedDuration {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime()) || now.getTime() < start.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
    };
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonthEnd.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalDays = Math.floor((now.getTime() - start.getTime()) / DAY_MS);

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours,
    minutes,
    seconds,
    totalDays: Math.max(0, totalDays),
  };
}

export function isAnniversaryToday(startIso: string, now: Date): boolean {
  const start = new Date(startIso);
  return (
    !Number.isNaN(start.getTime()) &&
    now.getDate() === start.getDate() &&
    now.getMonth() === start.getMonth() &&
    now.getFullYear() >= start.getFullYear()
  );
}

export function getNextAnniversaryCountdown(startIso: string, now: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  targetYearNumber: number;
} {
  const start = new Date(startIso);
  let targetYear = now.getFullYear();
  let nextDate = new Date(
    targetYear,
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes(),
    start.getSeconds()
  );

  if (nextDate.getTime() <= now.getTime()) {
    targetYear += 1;
    nextDate = new Date(
      targetYear,
      start.getMonth(),
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
      start.getSeconds()
    );
  }

  const diffSec = Math.max(0, Math.floor((nextDate.getTime() - now.getTime()) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    targetYearNumber: targetYear - start.getFullYear(),
  };
}

export function getDayMilestones(startIso: string, totalDays: number): MilestoneStatus[] {
  const start = new Date(startIso);
  const targets = [100, 200, 365, 500, 730, 1000, 1095, 1500];
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return targets.map((days) => {
    const targetDate = new Date(start.getTime() + days * DAY_MS);
    return {
      days,
      label: `${days} hari`,
      reached: totalDays >= days,
      dateLabel: formatter.format(targetDate),
    };
  });
}
