const groupsToReject = [
  // Not tech related
  'https://www.meetup.com/Kakis-SG-Anything-Watever-Meetup-Group/',
  'https://www.meetup.com/Wireless-devices-and-your-health/',
  // I find this one a bit spammy, feels like a marketing drive
  'https://www.meetup.com/A-US-stock-market-listedCo-Big-Data-AI-New-Technology/'
]

const probablyUnwantedRegex = /(business|marketing|superbowl|blockchain)/i

module.exports = {

  shouldRemoveGroup (group) {
    const onRejectList = groupsToReject.includes(group.link)
    // No need to log these, since they were explicitly listed

    const probablyUnwanted = group.name.match(probablyUnwantedRegex)

    if (probablyUnwanted && !onRejectList) {
      // We log these, in case the admin wants to reconsider
      console.info(`Group ${group.name} was marked as unwated by heuristics: ${group.link}`)
    }

    return onRejectList || probablyUnwanted
  }

}
