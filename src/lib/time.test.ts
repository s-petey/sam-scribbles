import { hourMinuteSecondFromDuration, isNew, isRecentlyUpdated } from '$lib/time';
import { DateTime, Duration } from 'effect';
import { describe, expect, test } from 'vitest';

const ZERO_SECS = Duration.millis(0);
const ONE_SECOND = Duration.seconds(1);
const FIFTY_NINE_SECS = Duration.seconds(59);
const ONE_MIN_SECS = Duration.minutes(1);
const ONE_MINUTE = Duration.minutes(1);
const SIXTY_ONE_SECS = Duration.seconds(61);
const ONE_MIN_FIFTY_NINE_SECS = Duration.seconds(119);
const FIFTY_NINE_MIN_FIFTY_NINE_SECS = Duration.seconds(3599);
const ONE_HOUR = Duration.hours(1);
const ONE_HOUR_ONE_MIN_SECS = Duration.minutes(61);
const TWO_HOURS_ONE_MIN_SECS = Duration.minutes(121);
const ONE_DAY = Duration.days(1);
const TWENTY_FOUR_HOURS = Duration.hours(24);
const ONE_WEEK = Duration.weeks(1);
const THIRTY_DAYS = Duration.days(30);
const THIRTY_TWO_DAYS = Duration.days(32);
const FIFTEEN_WEEKS = Duration.weeks(15);
const SEVENTEEN_WEEKS = Duration.weeks(17);
const ONE_YEAR = Duration.days(365);

describe('isNew', () => {
  const now = DateTime.unsafeNow();

  test.each([
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, THIRTY_DAYS))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_DAY))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_HOUR))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_MINUTE))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_SECOND))],
    [true, DateTime.toDateUtc(now)],
    [false, DateTime.toDateUtc(DateTime.subtractDuration(now, THIRTY_TWO_DAYS))],
    [false, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_YEAR))],
    [false, DateTime.toDateUtc(DateTime.addDuration(now, ONE_DAY))],
    [false, DateTime.toDateUtc(DateTime.addDuration(now, ONE_YEAR))],
  ])('should return %s for date %s', (expected, date) => {
    expect(isNew(date)).toBe(expected);
  });
});

describe('isRecentlyUpdated', () => {
  const now = DateTime.unsafeNow();
  test.each([
    [false, undefined],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, FIFTEEN_WEEKS))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_WEEK))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_DAY))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_HOUR))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_MINUTE))],
    [true, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_SECOND))],
    [true, DateTime.toDateUtc(now)],
    [false, DateTime.toDateUtc(DateTime.subtractDuration(now, SEVENTEEN_WEEKS))],
    [false, DateTime.toDateUtc(DateTime.subtractDuration(now, ONE_YEAR))],
    [false, DateTime.toDateUtc(DateTime.addDuration(now, ONE_DAY))],
    [false, DateTime.toDateUtc(DateTime.addDuration(now, ONE_YEAR))],
  ])('should return %s for date %s', (expected, date) => {
    expect(isRecentlyUpdated(date)).toBe(expected);
  });
});

describe('hourMinuteSecondFromDuration', () => {
  test.each([
    [ZERO_SECS, '0s'],
    [ONE_SECOND, '1s'],
    [FIFTY_NINE_SECS, '59s'],
    [ONE_MIN_SECS, '1m 0s'],
    [SIXTY_ONE_SECS, '1m 1s'],
    [ONE_MIN_FIFTY_NINE_SECS, '1m 59s'],
    [FIFTY_NINE_MIN_FIFTY_NINE_SECS, '59m 59s'],
    [ONE_HOUR, '1h 0m'],
    [ONE_HOUR_ONE_MIN_SECS, '1h 1m'],
    [TWO_HOURS_ONE_MIN_SECS, '2h 1m'],
    [TWENTY_FOUR_HOURS, 'Too long!'],
  ])('should return %s for %s seconds', (duration, expected) => {
    const seconds = Duration.toSeconds(duration);
    expect(hourMinuteSecondFromDuration(seconds)).toBe(expected);
  });
});
