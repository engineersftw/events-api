const blacklistedGroupUrls = [
  // Not tech related
  'https://www.meetup.com/Kakis-SG-Anything-Watever-Meetup-Group',
  'https://www.meetup.com/Wireless-devices-and-your-health',
  // This is not really tech specific
  'https://www.meetup.com/Startup-Agile-Group-Singapore',
  'https://www.meetup.com/Startup-Prodigy-Singapore',

  // this group mentioned that they will keep postponing events until COVID is over
  'https://www.meetup.com/Never-Code-Alone-SG'
]

const blacklistedGroups = [
  ...blacklistedGroupUrls.map(url =>
    url
      .replace('https://www.meetup.com/', '')
      .replace(/-/g, ' ')),
  'EMF & Wireless Radiation Safety'
]

function isBlacklisted (groupName) {
  return blacklistedGroups.includes(groupName)
}

module.exports = { blacklistedGroupUrls, blacklistedGroups, isBlacklisted }
