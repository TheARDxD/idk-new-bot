// [ANTISPAM] DONT DELETE THIS FILE
const { compareTwoStrings } = require("string-similarity")

module.exports = class SpamStore {
	constructor() {
		this.store = []
		this.lastStoreCleanTs = Date.now()
	}

	isSpam(message) {
		const currentMessageTs = Date.now()
		const currentMessageContent = message

		// Ignore messages older than 1 minute
		const oneMinuteStore = this.store.filter(
			m => m.timestamp + 60000 > currentMessageTs
		)

		// If store hasn't been cleaned in over a minute
		if (this.lastStoreCleanTs + 60000 < Date.now()) {
			this.store = oneMinuteStore
			this.lastStoreCleanTs = Date.now()
		}

		// Flood spam
		let lastXSecondsToMessageCountMap = {
			5: 0,
			15: 0,
			60: 0,
		}

		let last60SecondsCharacterCount = 0

		for (const message of oneMinuteStore) {
			// Message was sent within a minute of the currently iterated message
			if (currentMessageTs - 60000 < message.timestamp) {
				lastXSecondsToMessageCountMap[60]++
				last60SecondsCharacterCount += message.content.length
			}

			// Message was sent within 15 seconds of the currently iterated message
			if (currentMessageTs - 15000 < message.timestamp) {
				lastXSecondsToMessageCountMap[15]++
			}

			// Message was sent within 5 seconds of the currently iterated message
			if (currentMessageTs - 5000 < message.timestamp) {
				lastXSecondsToMessageCountMap[5]++
			}
			
		}

		if (lastXSecondsToMessageCountMap[5] >= 5) {
			return true
		} else if (lastXSecondsToMessageCountMap[15] >= 10) {
			return true
		} else if (lastXSecondsToMessageCountMap[60] >= 30) {
			return true
		} else if (last60SecondsCharacterCount >= 8000) {
			return true
		}

		// Duplicate spam
		let exactDuplicateCount = 0
		let largeMessageSimilarCount = 0

		for (const message of oneMinuteStore) {
				if (
					currentMessageTs < message.timestamp + 10000 &&
					message.content === currentMessageContent
				) {
					exactDuplicateCount++
				} else if (
					currentMessageTs < message.timestamp + 60000 &&
					message.content.length >= 200 &&
					compareTwoStrings(currentMessageContent, message.content) > 0.9
				) {
					return true
				}
		}

		if (exactDuplicateCount > 2) {
			return true
		}

        // Newline spam
        let newlines = currentMessageContent.split("\n").length
		let ratio = currentMessageContent.length / newlines

		if (newlines >= 15 && ratio < 5) {
			return true
		}

		return false
	}

	storeMessage(message) {
		this.store.push({
			content: message,
			timestamp: Date.now(),
		})
	}
}