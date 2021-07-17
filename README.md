# Timesheets

This is a timesheet web app that **works offline**, is **installable on your phone**, and **is easy to use**.

## How to install on your phone

Visit [https://ryanberliner.com/timesheets/index.html](https://ryanberliner.com/timesheets/index.html)

To install on your home screen (which is **required for offline usage**), follow the instructions for your type of phone.

- [Instructions for iPhone](https://www.macrumors.com/how-to/add-a-web-link-to-home-screen-iphone-ipad/)
- [Instructions for Android](https://www.howtogeek.com/667938/how-to-add-a-website-to-your-android-home-screen/)

## Why was this created

It was created with the intention of timing enduro mountain bike races. This is a race format that involves
multiple timed segments called "stages". Each racer goes 1 at a time on each stage, leaving plently of space in 
between racers so they don't run into each other. The person with the quickest total time (sum of all their stages) wins.

The problem is that stage start and finish points are typically in the woods without cell reception and away
from power. Bringing a bunch of synced stop watches or timing equipment into the woods, and writing things down is a PITA
when all you need is some basic timing thats stopwatch accurate.

This is free, simple solution to the problem. Each timer should install the web app on their phone before
going out of cell reception, and they are good to go.

When timers get back to cell reception, they can share their timesheets with person responsible for posting results, and that person can copy-paste into a spreadsheet and figure out results.

**This would work great for similar use cases, too, obviously.**

## How it works

All that really matters when it comes to timing racers on these stages is "when did they start" and "when did they end".

Times are saved in unix time millisonds (the number of milliseconds since 00:00:00 UTC on 1 January 1970). To make up for any time differences between devices, there is a sync feature that can be used either before or after the timing an event, so you can adjust for descrepencies. Theorectically this should not be needed, but unfortunately some devices have different clocks. The sync feature allows you to clean up small time descrepencies between device types if you want. **If all you care about is "who is fastest" syncing isn't needed.**

All data is stored locally on your device, there are no servers processing timesheets, and there are no databases saving timesheets. If you clear your device or browser data your timesheets will be gone forever.