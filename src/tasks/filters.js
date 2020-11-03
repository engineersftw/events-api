module.exports = {

  shouldRemoveGroup (group) {
    return (
      // Not tech related
      group.link === 'https://www.meetup.com/Kakis-SG-Anything-Watever-Meetup-Group/' ||
      group.link === 'https://www.meetup.com/Wireless-devices-and-your-health/'
    )
  }

}
