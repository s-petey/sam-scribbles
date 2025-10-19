import { DateTime, Duration } from 'effect';

const THIRTY_ONE_DAYS = Duration.days(31);
const ZERO_MILLIS = Duration.millis(0);
const SIXTEEN_WEEKS = Duration.weeks(16);

export function isNew(date: Date) {
  const nowMillis = Duration.millis(Date.now());
  const dateMillis = Duration.millis(date.getTime());
  const difference = Duration.subtract(nowMillis, dateMillis);

  if (Duration.greaterThan(dateMillis, nowMillis)) {
    return false;
  }

  return (
    Duration.lessThanOrEqualTo(difference, THIRTY_ONE_DAYS) &&
    Duration.greaterThanOrEqualTo(difference, ZERO_MILLIS)
  );
}

export function isRecentlyUpdated(date: Date | undefined) {
  if (!date) {
    return false;
  }

  const now = DateTime.unsafeNow();
  const nowMillis = Duration.millis(DateTime.toEpochMillis(now));
  const dateMillis = Duration.millis(date.getTime());

  if (Duration.greaterThan(dateMillis, nowMillis)) {
    return false;
  }

  const difference = Duration.subtract(nowMillis, dateMillis);

  return (
    Duration.lessThanOrEqualTo(difference, SIXTEEN_WEEKS) &&
    Duration.greaterThanOrEqualTo(difference, ZERO_MILLIS)
  );
}

export function hourMinuteSecondFromDuration(seconds: number): string {
  const duration = Duration.seconds(seconds);

  const durationParts = Duration.parts(duration);

  if (durationParts.days > 0) {
    return 'Too long!';
  }

  if (durationParts.hours > 0) return `${durationParts.hours}h ${durationParts.minutes}m`;
  if (durationParts.minutes > 0) return `${durationParts.minutes}m ${durationParts.seconds}s`;
  return `${durationParts.seconds}s`;
}
