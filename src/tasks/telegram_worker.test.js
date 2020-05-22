const moment = require('moment-timezone')
const {filterEvents, processEvents} = require('./telegram_worker')

test('undesired events should be filtered', () => {

    const events = [
        {
            name: "a",
            location: "my house",
            url: "www.heymyhouse.com",
            group_name: "Kakis SG Anything Watever Meetup Group",
            group_url: "www.heymyhouse.com",
            formatted_time: moment().tz('Asia/Singapore').format('h:mm a')
        },
        {
            name: "b",
            location: "my other house",
            url: "www.heymyhouse.com",
            group_name: "EMF & Wireless Radiation Safety",
            group_url: "www.heymyhouse.com",
            formatted_time: moment().tz('Asia/Singapore').format('h:mm a')
        }
    ]

    expect(events.filter(filterEvents)).toStrictEqual([])

})

test('events should be filtered and deduplicated after processing', () => {

    const now = moment().tz('Asia/Singapore').format('h:mm a')

    const events = [
        {
            name: "a",
            location: "my house",
            url: "www.heymyhouse.com",
            group_name: "My House Group",
            group_url: "www.heymyhouse.com",
            formatted_time: now
        },
        {
            name: "a",
            location: "my house",
            url: "www.heymyhouse.com",
            group_name: "My House Group",
            group_url: "www.heymyhouse.com",
            formatted_time: now
        },
        {
            name: "b",
            location: "my other house",
            url: "www.heymyhouse.com",
            group_name: "EMF & Wireless Radiation Safety",
            group_url: "www.heymyhouse.com",
            formatted_time: now
        }
    ]

    expect(processEvents(events)).toStrictEqual([
        {
            name: "a",
            location: "my house",
            url: "www.heymyhouse.com",
            group_name: "My House Group",
            group_url: "www.heymyhouse.com",
            formatted_time: now
        }
    ])
})