import React, { useContext, useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import metamaskLogo from "../assets/metamask-face.png";
import movrLogo from "../assets/movr_logo.png";
import zoomLogo from "../assets/zoombies_logo_round_plaque.svg";
import Tooltip from "@mui/material/Tooltip";
import { store } from "store/store";
import { Link } from "react-router-dom";
import { faEdit, faShoppingBag } from "@fortawesome/free-solid-svg-icons";

import { getWalletWMOVRBalance, getWalletZoomBalance } from "../utils/wallet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {Button, ButtonGroup, FormControl, InputLabel, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";


const Container = styled.div`
  //width: 300px;
  
  display: flex;
  flex-direction: row;
  padding: 8px;
  
  .button-sortby-addon {
    width: 30px;
  }

`;


const Filterbar = ( { onFilterChanged, filters, onSortByChanged, sortBy }) => {

  const theme = useTheme();

  return (
    <Container>
      <Select
            value={filters.cardType}
            onChange={(e) => onFilterChanged({ cardType: e.target.value })}
            displayEmpty
        >
          <MenuItem value={''}>All Cards</MenuItem>
          <MenuItem value={'store'}>Shop</MenuItem>
          <MenuItem value={'booster'}>Booster</MenuItem>
        </Select>

      <Select
          value={filters.token}
          onChange={(e) => onFilterChanged({token: e.target.value}) }
          displayEmpty
      >
        <MenuItem value={''}>All</MenuItem>
        <MenuItem value={'wmovr'}>WMOVR</MenuItem>
        <MenuItem value={'zoom'}>ZOOM</MenuItem>
      </Select>
    
      <Select
          value={sortBy.field}
          onChange={(e) => onSortByChanged({ field: e.target.value }) }
          displayEmpty
      >
          <MenuItem value={''}>Sort By</MenuItem>
          <MenuItem value={'auctionEnd'}>End Time</MenuItem>
          <MenuItem value={'minPrice'}>Min Price</MenuItem>
          <MenuItem value={'highestBid'}>Highest Bid</MenuItem>
      </Select>

      {
        sortBy.field !== '' &&
        <Button style={{ color: 'white' }} className={"btn btn-secondary button-sortby-addon"} onClick={() => onSortByChanged({ order: sortBy.order * -1 })}>
          { sortBy.order === 1 ? '↓' : '↑' }
        </Button>
      }
      
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button style={{ color: 'white' }} className={"btn btn-secondary"} onClick={() => onFilterChanged({rarity: ''})}>All</Button>
        <Button style={{background: theme.colors.epic, color: 'white'}} onClick={() => onFilterChanged({rarity: 'Epic'})}>E</Button>
        <Button style={{background: theme.colors.rare, color: 'white'}} onClick={() => onFilterChanged({rarity: 'Rare'})}>R</Button>
        <Button style={{background: theme.colors.uncommon, color: 'white'}} onClick={() => onFilterChanged({rarity: 'Uncommon'})}>U</Button>
        <Button style={{background: theme.colors.common, color: 'white'}} onClick={() => onFilterChanged({rarity: 'Common'})}>C</Button>
      </ButtonGroup>


    </Container>
  );
};

export default Filterbar;
