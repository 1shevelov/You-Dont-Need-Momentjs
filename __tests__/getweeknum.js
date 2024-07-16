const { getWeek, format } = require('date-fns');

// test dates array
// and ISO 8601 week numbers for each date
const testDates = [
  { date: '2024-06-27', week: 26 },
  { date: '2023-12-28', week: 52 }, //12-30
  { date: '2025-01-01', week: 1 },
  { date: '2026-12-28', week: 53 },
  { date: '2027-01-01', week: 53 }, // 01-03
  { date: '2024-02-29T23:55:16.652Z', week: 9 },
  { date: '2027-01-03T23:58:16.652Z', week: 53 },
  { date: '2027-01-04T00:00:16.652Z', week: 1 },
  { date: '2023-01-01T23:59:16.652Z', week: 52 },
  { date: '2023-01-08T23:01:16.652Z', week: 1 },
  { date: '2024-03-31T23:59:16.652Z', week: 13 },
  { date: '2024-12-30T00:02:16.652Z', week: 1 },
];

// Wednesdays & Thursdays only
const testDatesWedAndThu = [
  { date: '2024-06-27', week: 26 },
  { date: '2023-12-28', week: 52 },
  { date: '2025-01-01', week: 1 },
  { date: '2026-12-31', week: 53 },
  { date: '2024-02-29', week: 9 },
  { date: '2027-01-07', week: 1 },
  { date: '2022-12-28', week: 52 },
  { date: '2020-12-30', week: 53 },
  { date: '2016-03-31', week: 13 },
  { date: '1997-12-31', week: 1 },
];

// source: README.md:590
function getWeekNum_01(inputDate) {
  const day = new Date(inputDate);
  const MILLISECONDS_IN_WEEK = 604800000;
  const firstDayOfWeek = 1; // monday as the first day (0 = sunday)
  const startOfYear = new Date(day.getFullYear(), 0, 1);
  startOfYear.setDate(
    startOfYear.getDate() + (firstDayOfWeek - (startOfYear.getDay() % 7))
  );
  return Math.round((day - startOfYear) / MILLISECONDS_IN_WEEK) + 1;
}

// failed on "2022-12-28"
// describe("01: native from README.md:590", () => {
//     it("", () => {
//         for (let i = 0; i < testDatesWedAndThu.length; i++) {
//             const d = new Date(testDatesWedAndThu[i].date);
//             console.log(d);
//             const w = testDatesWedAndThu[i].week;
//             expect(getWeekNum_01(d)).toEqual(w);
//         }
//     });
// });

// https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
// 13 years ago, 205 upvotes
function getCalendarWeek(date) {
  var oneJan = new Date(date.getFullYear(), 0, 1);
  var numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
  var result = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
  return result;
}

// failed on "2024-06-27" (1)
test.each(testDatesWedAndThu)(
  '02: native popular on stackoverflow',
  ({ date, week }) => {
    expect(getCalendarWeek(new Date(date))).toBe(week);
  }
);

// https://www.epoch-calendar.com/support/getting_iso_week.html
/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
Date.prototype.getWeek = function(dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com */

  dowOffset = typeof dowOffset == 'int' ? dowOffset : 0; //default dowOffset to zero
  var newYear = new Date(this.getFullYear(), 0, 1);
  var day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = day >= 0 ? day : day + 7;
  var daynum =
    Math.floor(
      (this.getTime() -
        newYear.getTime() -
        (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
        86400000
    ) + 1;
  var weeknum;
  //if the year starts before the middle of a week
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      nYear = new Date(this.getFullYear() + 1, 0, 1);
      nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
                   the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};

// failed on "2026-12-31"
describe('03: from epoch-calendar.com', () => {
  it('', () => {
    for (let i = 0; i < testDatesWedAndThu.length; i++) {
      const d = new Date(testDatesWedAndThu[i].date);
      console.log(`${i} / date: "${d}"`);
      const w = testDatesWedAndThu[i].week;
      expect(new Date(d).getWeek(1)).toEqual(w);
    }
  });
});

// getWeek from date-fns lib
// no fails
describe('04: getWeek() from date-fns', () => {
  it('', () => {
    for (let i = 0; i < testDatesWedAndThu.length; i++) {
      const d = new Date(testDatesWedAndThu[i].date);
      console.log(`${i} / date: "${d}"`);
      const w = testDatesWedAndThu[i].week;
      expect(getWeek(d, { weekStartsOn: 1, firstWeekContainsDate: 4 })).toEqual(
        w
      );
    }
  });
});
