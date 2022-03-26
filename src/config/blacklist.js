const blacklistedGroupUrls = [
  // Not tech related
  'https://www.meetup.com/Kakis-SG-Anything-Watever-Meetup-Group',
  'https://www.meetup.com/Wireless-devices-and-your-health',
  // I find this one a bit spammy, feels like a marketing drive
  'https://www.meetup.com/A-US-stock-market-listedCo-Big-Data-AI-New-Technology',
  // Cheap python courses ("crash course" and "full course"). Might be useful for new developers, but they are flooding our events list, and always the same thing!
  'https://www.meetup.com/Data-Science-and-Machine-Learning-University',
  'https://www.meetup.com/Teach-Code-for-Everyone',
  // A bit spammy
  'https://www.meetup.com/get-a-software-job-learn-coding-for-non-computer-sci-majors',
  // This is not really tech specific
  'https://www.meetup.com/Startup-Agile-Group-Singapore',
  'https://www.meetup.com/Startup-Prodigy-Singapore',

  // this group mentioned that they will keep postponing events until COVID is over
  'https://www.meetup.com/Never-Code-Alone-SG'
]

module.exports = { blacklistedGroupUrls }