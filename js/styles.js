import { StyleSheet } from 'react-native';

import { ANNICT_COLOR, GOFUN } from './colors';

export default StyleSheet.create({
  resetFilterHeader: {
    backgroundColor: ANNICT_COLOR,
    flex: 1
  },
  episodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10
  },
  episodeRowSelectable: {
    flex: 5,
    flexDirection: 'row'
  },
  episodeRowThumbnail: {
    height: 50,
    width: 50,
    borderWidth: 0,
    borderRadius: 5,
    flex: 1
  },
  episodeRowBody: {
    marginLeft: 10,
    flexDirection: 'column',
    flex: 4
  },
  episodeRowAction: {
    marginLeft: 10,
    flex: 0.5
  },
  episodeRowText: {
    fontSize: 12
  },
  boldText: {
    fontWeight: 'bold'
  },
  programSearch: {
    padding: 10
  },
  programRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10
  },
  programRowThumbnail: {
    height: 50,
    width: 50,
    borderWidth: 0,
    borderRadius: 5,
    flex: 1
  },
  programRowNoImage: {
    borderWidth: 1,
    borderColor: ANNICT_COLOR,
    alignItems: 'center',
    justifyContent: 'center'
  },
  programRowBody: {
    marginLeft: 10,
    flexDirection: 'column',
    flex: 4
  },
  programRowAction: {
    flex: 2,
    alignItems: 'center'
  },
  regularText: {
    fontSize: 12
  },
  regularButton: {
    padding: 15,
    borderRadius: 5,
    borderWidth: 0,
    backgroundColor: ANNICT_COLOR,
    alignItems: 'center'
  },
  screen: {
    flex: 1,
    backgroundColor: GOFUN
  }
});
