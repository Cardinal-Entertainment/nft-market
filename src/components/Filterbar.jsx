import React from 'react';
import debounce from 'lodash/debounce';
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import { alpha, Select, Grid } from '@mui/material';
import { wmovrContractAddress, zoomContractAddress } from '../constants';

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const FilterRow = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  margin: '12px 0',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  color: 'white',

  '& .button-rarity': {
    color: 'white',
  },
}));

const FilterControls = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',

  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    flex: 'auto',
  },
}));

const SortControls = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  margin: '0 16px',
  flexWrap: 'wrap',
  alignItems: 'center',
  fontSize: '18px',

  [theme.breakpoints.down('md')]: {
    margin: '0',
    justifyContent: 'center',
    flex: 'auto',
  },

  '& .button-sortby-addon': {
    width: '30px',
  },

  '& .sort-component': {
    borderRight: '2px solid white',
    padding: '0 8px',
    lineHeight: '18px',
  },

  '& .sort-component-selected': {
    borderRight: '2px solid white',
    textDecoration: 'underline',
    padding: '0px 8px',
    lineHeight: '18px',
  },

  '& .sort-component:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },

  '& .last-column': {
    borderRight: 'none! important',
  },
}));

const SearchHeader = styled(Grid)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

const SearchCountDiv = styled(Grid)(({ theme }) => ({
  color: 'white',
  fontWeight: 500,
  fontSize: '32px',
  lineHeight: '47px',

  '& span': {
    fontWeight: 300,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  marginRight: '12px',
  color: 'white',
  border: 'none',
  fontFamily: 'Oswald',
  fontSize: '18px',
  '& svg': {
    fill: 'white',
  },

  [theme.breakpoints.down('md')]: {
    marginRight: '0px',
  },
}));

const SearchDiv = styled(Grid)(({ theme }) => ({
  height: '47px',
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

const SearchInputContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
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

const Filterbar = ({ onFilterChanged, filters, totalCount }) => {
  const debouncedFilterChanged = debounce(onFilterChanged, 500);
  const { sortField } = filters;

  return (
    <Container>
      <SearchHeader container>
        <SearchCountDiv>
          Live Now -{' '}
          <span>{totalCount ? totalCount + ' items' : 'No auctions'}</span>
        </SearchCountDiv>
        <SearchInputContainer>
          <SearchDiv>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
              onChange={(e) =>
                debouncedFilterChanged({ keyword: e.target.value })
              }
            />
          </SearchDiv>
        </SearchInputContainer>
      </SearchHeader>

      <FilterRow>
        <FilterControls>
          <StyledSelect
            value={filters.token}
            onChange={(e) => onFilterChanged({ token: e.target.value })}
            displayEmpty
          >
            <MenuItem value={''}>Coin Type</MenuItem>
            <MenuItem value={wmovrContractAddress}>WMOVR</MenuItem>
            <MenuItem value={zoomContractAddress}>ZOOM</MenuItem>
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
            value={filters.cardType}
            onChange={(e) => onFilterChanged({ cardType: e.target.value })}
            displayEmpty
          >
            <MenuItem value={''}>Card Type</MenuItem>
            <MenuItem value={'Store'}>Store</MenuItem>
            <MenuItem value={'Booster'}>Booster</MenuItem>
          </StyledSelect>
        </FilterControls>

        <SortControls>
          <div>Sort:</div>
          <div
            className={
              sortField === 'auctionEnd'
                ? 'sort-component-selected'
                : 'sort-component'
            }
            onClick={() => onFilterChanged({ sortField: 'auctionEnd' })}
          >
            Ending Soon
          </div>
          <div
            className={
              sortField === 'created'
                ? 'sort-component-selected'
                : 'sort-component'
            }
            onClick={() => onFilterChanged({ sortField: 'created' })}
          >
            Just Posted
          </div>
          <div
            className={
              sortField === 'popularity'
                ? 'sort-component-selected last-column'
                : 'sort-component last-column'
            }
            onClick={() => onFilterChanged({ sortField: 'popularity' })}
          >
            Popular
          </div>
        </SortControls>
      </FilterRow>
    </Container>
  );
};

export default Filterbar;
