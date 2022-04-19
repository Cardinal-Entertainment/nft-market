import { NETWORKS } from '../constants'

export const getCardType = async (cardId) => {
  try {
    const response = await fetch(
      `https://zoombies.world/services/card_types/${cardId}.json`
    )
    const cardType = await response.json()
    return cardType
  } catch (err) {
    console.error(err)
  }
}

export const RARITY_CLASSES = {
  Common: 'card-bg card-bg-6',
  Uncommon: 'card-bg card-bg-5',
  Rare: 'card-bg card-bg-4',
  Epic: 'card-bg card-bg-3',
  Platinum: 'card-bg card-bg-2',
  Diamond: 'card-bg card-bg-1',
}

export const getCardData = async (tokenId, nftContract, networkName) => {
  if (nftContract.address === NETWORKS[networkName].zoombiesContractAddress) {
    // In case of Zoombies - call nftContract.getNFTData
    const [cardTypeId, editionNumber] = await nftContract.getNFTData(tokenId)
    const cardData = await getCardType(cardTypeId)

    cardData.id = tokenId
    let newAttr = {}

    cardData.attributes.forEach((attribute) => {
      newAttr[attribute.trait_type] = attribute.value
    })

    cardData.attributes = newAttr
    cardData.attributes.edition_current = parseInt(editionNumber)
    if (cardData.attributes.edition_total === 0) {
      //unlimited
      cardData.attributes.edition_label =
        '#' + cardData.attributes.edition_current
    } else {
      cardData.attributes.edition_label =
        '#' +
        cardData.attributes.edition_current +
        ' of ' +
        cardData.attributes.edition_total
    }

    cardData.attributes.rarityValue = cardData.attributes.rarity
    cardData.attributes.rarity = RARITY_CLASSES[cardData.attributes.rarity]

    newAttr = { ...newAttr, ...cardData }
    newAttr['isNotZoombies'] = false
    delete newAttr.attributes

    return newAttr
  } else {
    const tokenURL = await nftContract.tokenURI(tokenId)
    console.log('url1', tokenURL)

    const response = await fetch(tokenURL)
    let json = await response.json()
    json['id'] = tokenId
    json['isNotZoombies'] = true
    return json
  }
}

export const getCardSummary = (cards) => {
  if (!cards) {
    return ''
  }
  const countByRarity = cards.reduce((summary, card) => {
    const { rarity } = card
    if (!summary.hasOwnProperty(rarity)) {
      summary[rarity] = 0
    }
    summary[rarity]++
    return summary
  }, {})

  return (
    Object.keys(countByRarity)
      .map((rarity) => `${countByRarity[rarity]} ${rarity}`)
      .join(', ') +
    ' (' +
    cards.map((card) => card.name).join(',') +
    ')'
  )
}
