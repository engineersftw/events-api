const MeetupHarvester = require('./harvesters/meetup_harvester')
const Sentry = require('@sentry/node')

class HarvesterService {
  constructor (options = {}) {
    this.meetup = options.meetup
  }

  async prepareService () {
    try {
      this.meetupHarvester = new MeetupHarvester(this.meetup)
      await this.meetupHarvester.prepareService()
    } catch (err) {
      console.log('Prepare Service Error', err)
      Sentry.captureException(err)
    }
  }

  async fetchGroups () {
    const allGroups = {
      meetup: []
    }

    try {
      const meetupGroups = await this.meetupHarvester.fetchGroups()

      allGroups.meetup.push(...meetupGroups)
    } catch (err) {
      console.log('Harvester Error', err)
      Sentry.captureException(err)
    }

    return allGroups
  }

  async fetchGroupEvents (group) {
    const allGroupEvents = []

    try {
      switch (group.platform) {
        case 'meetup':
          const meetupGroupEvents = await this.meetupHarvester.fetchGroupEvents(group)
          allGroupEvents.push(...meetupGroupEvents)
          break
      }
    } catch (err) {
      console.log('Harvester Error', err)
      Sentry.captureException(err)
    }

    return {
      group: group,
      events: allGroupEvents
    }
  }
}

module.exports = HarvesterService
