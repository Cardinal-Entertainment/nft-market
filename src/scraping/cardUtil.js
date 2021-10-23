#!/usr/bin/env node

const { zoombiesContract } = require("./contracts");

const axios = require("axios");
const MongoClient = require("./database");

async function getCardType(cardTypeId) {
  const response = await axios.get(
    `https://zoombies.world/services/card_types/${cardTypeId}.json`
  );
  const cardType = response.data;
  return cardType;
}

const RARITY_CLASSES = {
  Common: "card-bg card-bg-6",
  Uncommon: "card-bg card-bg-5",
  Rare: "card-bg card-bg-4",
  Epic: "card-bg card-bg-3",
  Platinum: "card-bg card-bg-2",
  Diamond: "card-bg card-bg-1",
};

async function getCardData(tokenId) {
  try {
    const [cardTypeId, editionNumber] = await zoombiesContract.getNFTData(
      tokenId
    );
    const cardData = await getCardType(cardTypeId);

    console.log(cardData);

    cardData.id = tokenId;
    let newAttr = {};

    cardData.attributes.forEach((attribute) => {
      newAttr[attribute.trait_type] = attribute.value;
    });

    cardData.attributes = newAttr;
    cardData.attributes.edition_current = parseInt(editionNumber);
    if (cardData.attributes.edition_total === 0) {
      //unlimited
      cardData.attributes.edition_label =
        "#" + cardData.attributes.edition_current;
    } else {
      cardData.attributes.edition_label =
        "#" +
        cardData.attributes.edition_current +
        " of " +
        cardData.attributes.edition_total;
    }

    cardData.attributes.rarityValue = cardData.attributes.rarity;
    cardData.attributes.rarity = RARITY_CLASSES[cardData.attributes.rarity];

    newAttr = { ...newAttr, ...cardData };
    delete newAttr.attributes;

    return newAttr;
  } catch (err) {
    console.error("Failed to get card data: ", err);
  }
}

async function getAndStoreCards(tokenIds, auctionItemNumber) {
  const cardInfoArray = [];
  const cardCollection = MongoClient.client.getCollection("cardTypes");

  for (const tokenId of tokenIds) {
    const cardData = await getCardData(tokenId);

    /**
     * We should only store attributes that are needed for rendering, filtering, sorting.
     */
    const cardInfoToStore = {
      name: cardData.name,
      image: cardData.image,
      description: cardData.description,
      externalUrl: cardData.external_url,
      cardSet: cardData.card_set,
      typeId: cardData.type_id,
      zoombieType: cardData.zombie_type,
      auctionItem: auctionItemNumber,
      rarity: cardData.rarityValue,
    };

    cardInfoArray.push(cardInfoToStore);
  }

  if (cardInfoArray.length > 0) {
    cardCollection.insertMany(cardInfoArray);
  }

  console.log(`Fetched/Stored ${cardInfoArray.length} cards.`);

  return cardInfoArray;
}

module.exports = {
  getAndStoreCards,
};
