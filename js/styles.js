import { StyleSheet } from 'react-native';
import { Constants } from 'expo';

import { ANNICT_COLOR, GOFUN, NAMARI } from './colors';

export default StyleSheet.create({
  header: {
    backgroundColor: ANNICT_COLOR,
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 10,
    paddingTop: 15 + Constants.statusBarHeight
  },
  headerText: {
    fontWeight: 'bold'
  },
  headerItem: {
    flex: 1
  },
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
  episodeRowMainText: {
    fontSize: 18
  },
  boldText: {
    fontWeight: 'bold'
  },
  programSearch: {
    padding: 10
  },
  programRow: {
    justifyContent: 'space-between',
    margin: 10
  },
  programRowThumbnail: {
    height: 50,
    width: 50,
    borderWidth: 0,
    borderRadius: 5
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
    flex: 1
  },
  programRowAction: {
    flex: 1,
    marginRight: 5,
    marginLeft: 5
  },
  smallText: {
    fontSize: 10
  },
  regularText: {
    fontSize: 12
  },
  bigText: {
    fontSize: 18
  },
  subText: {
    color: NAMARI
  },
  regularButton: {
    padding: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: ANNICT_COLOR,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  regularButtonFilled: {
    padding: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 5,
    borderWidth: 0,
    backgroundColor: ANNICT_COLOR,
    alignItems: 'center'
  },
  screen: {
    flex: 1,
    backgroundColor: GOFUN
  },
  selectedSegment: {
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: ANNICT_COLOR,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  unSelectedSegment: {
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center'
  }
});
