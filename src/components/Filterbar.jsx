import React from "react";
import { useTheme } from "styled-components";
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import {alpha, Button, ButtonGroup, FormControl, InputLabel, Select} from "@mui/material";

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column'
}))

const FilterRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '12px',
  flexWrap: 'wrap',

  '& .button-sortby-addon': {
    width: '30px'
  },
  '& .button-rarity': {
    color: 'white'
  }
}));

const SearchHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',

  '& .live-header': {
    color: 'white',
    fontWeight: 500,
    fontSize: '32px',
    lineHeight: '47px',

    '& span': {
      fontWeight: 300
    }
  },
}))

const StyledSelect = styled(Select)(({ theme }) => ({
  marginRight: '12px',
  color: 'white',
  border: 'none',
  fontFamily: 'Oswald',
  '& svg': {
    fill: 'white',
  },
}));

const Search = styled('div')(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  color: 'white',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid white',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  fontFamily: 'Oswald',
  '& .MuiInputBase-input': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',

    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));


const Filterbar = ( { onFilterChanged, filters, onSortByChanged, sortBy, totalCount }) => {

  const theme = useTheme();

  return (
    <Container >
      <SearchHeader>
        <div className={'live-header'}>
          Live Now - <span>{totalCount ? totalCount + " items" : 'No auctions'}</span>
        </div>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search"
            inputProps={{ 'aria-label': 'search' }}
            onChange={(e) => onFilterChanged({ keyword: e.target.value })}
          />
        </Search>
      </SearchHeader>

      <FilterRow>
        <StyledSelect
          value={filters.token}
          onChange={(e) => onFilterChanged({token: e.target.value}) }
          displayEmpty
        >
          <MenuItem value={''}>Coin Type</MenuItem>
          <MenuItem value={'wmovr'}>WMOVR</MenuItem>
          <MenuItem value={'zoom'}>ZOOM</MenuItem>
        </StyledSelect>

        <StyledSelect
          value={filters.rarity}
          onChange={(e) => onFilterChanged({ rarity: e.target.value })}
          displayEmpty
        >
          <MenuItem value={''}>Rarity</MenuItem>
          <MenuItem value={'Epic'}>Epic</MenuItem>
          <MenuItem value={'Rare'}>Rare</MenuItem>
          <MenuItem value={'Uncommon'}>Uncommon</MenuItem>
          <MenuItem value={'Common'}>Common</MenuItem>
        </StyledSelect>

        <StyledSelect
            value={sortBy.field}
            onChange={(e) => onSortByChanged({ field: e.target.value }) }
            displayEmpty
        >
            <MenuItem value={''}>Sort By</MenuItem>
            <MenuItem value={'auctionEnd'}>End Time</MenuItem>
            <MenuItem value={'minPrice'}>Min Price</MenuItem>
            <MenuItem value={'highestBid'}>Highest Bid</MenuItem>
        </StyledSelect>

        {
          sortBy.field !== '' &&
          <Button style={{ color: 'white' }} className={"btn btn-secondary button-sortby-addon"} onClick={() => onSortByChanged({ order: sortBy.order * -1 })}>
            { sortBy.order === 1 ? '↓' : '↑' }
          </Button>
        }

        <StyledSelect
          value={filters.cardType}
          onChange={(e) => onFilterChanged({ cardType: e.target.value })}
          displayEmpty
        >
          <MenuItem value={''}>Card Type</MenuItem>
          <MenuItem value={'Store'}>Store</MenuItem>
          <MenuItem value={'Booster'}>Booster</MenuItem>
        </StyledSelect>

        {/*<ButtonGroup variant="contained" aria-label="outlined primary button group">*/}
        {/*  <Button className={"btn-rarity-all"} onClick={() => onFilterChanged({rarity: ''})}>All</Button>*/}
        {/*  <Button style={{background: theme.colors.epic, color: 'white'}} onClick={() => onFilterChanged({rarity: 'Epic'})}>E</Button>*/}
        {/*  <Button style={{background: theme.colors.rare, color: 'white'}} onClick={() => onFilterChanged({rarity: 'Rare'})}>R</Button>*/}
        {/*  <Button style={{background: theme.colors.uncommon, color: 'white'}} onClick={() => onFilterChanged({rarity: 'Uncommon'})}>U</Button>*/}
        {/*  <Button style={{background: theme.colors.common, color: 'white'}} onClick={() => onFilterChanged({rarity: 'Common'})}>C</Button>*/}
        {/*</ButtonGroup>*/}
      </FilterRow>
    </Container>
  );
};

export default Filterbar;
