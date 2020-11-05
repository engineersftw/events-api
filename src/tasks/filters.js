const blacklistRegex = /(business|marketing|superbowl|blockchain)/i

module.exports = {

  shouldRemoveGroup (group) {
    const probablyUnwanted = group.name.match(blacklistRegex)

    if (probablyUnwanted) {
      console.info(`Group ${group.name} was marked as unwated by heuristics`)
    }

    const onRejectList = (
      // Not tech related
      group.link === 'https://www.meetup.com/Kakis-SG-Anything-Watever-Meetup-Group/' ||
      group.link === 'https://www.meetup.com/Wireless-devices-and-your-health/'
    )
    // No need to log these, since they were explicitly listed

    return onRejectList || probablyUnwanted
  }

}
