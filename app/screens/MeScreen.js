import React, { Component } from 'react';
import TitleBar from '../views/TitleBar';
import ListItem from '../views/ListItem';
import ListItemDivider from '../views/ListItemDivider';
import StorageUtil from '../utils/StorageUtil';
import CommonLoadingView from '../views/CommonLoadingView';
import CountEmitter from '../event/CountEmitter';
import NIM from 'react-native-netease-im';
import global from '../utils/global';
import utils from '../utils/utils';

import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  PixelRatio,
  ScrollView,
  ToastAndroid,
  TouchableHighlight
} from 'react-native';

var { width, height } = Dimensions.get('window');

export default class MeScreen extends Component {
  static navigationOptions = {
    tabBarLabel: '我',
    tabBarIcon: ({ focused, tintColor }) => {
      if (focused) {
        return (
          <Image style={styles.tabBarIcon} source={require('../../images/ic_me_selected.png')}/>
        );
      }
      return (
        <Image style={styles.tabBarIcon} source={require('../../images/ic_me_normal.png')}/>
      );
    },
  };
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      avatar: '',
      loadingState: global.loading,
    };
    this.loadUserInfo();
  }
  loadUserInfo() {
    StorageUtil.get('username', (error, object)=>{
      if (!error && object != null) {
        this.setState({username: object.username});
        this.getAvatar();
      } else {
        this.setState({loadingState: global.loadError});
      }
    });
  }
  getAvatar() {
    StorageUtil.get('avatar', (error, object)=>{
      if (!error && object != null) {
        this.setState({avatar: object.avatar});
        this.getUserInfo();
      } else {
        this.setState({loadingState: global.loadError});
      }
    })
  }
  getUserInfo() { // 会从缓存里取
    NIM.getUserInfo(this.state.username).then((data)=>{
      if (data != null && data.name != undefined) {
        this.setState({loadingState: global.loadSuccess, userInfo: data});
      } else {
        this.fetchUserInfo();
      }
    });
  }
  fetchUserInfo() { // 从服务器获取
    NIM.fetchUserInfo(this.state.username).then((data)=>{
      if (data != null && data.name != undefined) {
        this.setState({loadingState: global.loadSuccess, userInfo: data});
      } else {
        this.setState({loadingState: global.loadError});
      }
    });
  }
  componentWillMount() {
    CountEmitter.addListener('updateAvatar', ()=>{
      // 刷新头像
      this.getAvatar();
    });
    CountEmitter.addListener('updateUserInfo', ()=>{
      // 刷新用户数据
      this.loadUserInfo();
    });
  }
  render() {
    switch (this.state.loadingState) {
      case global.loading:
        return this.renderLoadingView();
      case global.loadSuccess:
        return this.renderDetailView();
      case global.loadError:
        return this.renderErrorView();
    }
  }
  renderLoadingView() {
    return (
      <View style={styles.container}>
        <TitleBar nav={this.props.navigation}/>
        <View style={styles.content}>
          <CommonLoadingView hintText={"正在获取联系人数据..."}/>
        </View>
      </View>
    );
  }
  renderErrorView() {
    return (
      <View style={styles.container}>
        <TitleBar nav={this.props.navigation}/>
        <TouchableOpacity style={styles.content} activeOpacity={0.6} onPress={()=>this.getUserInfo()}>
          <View style={[styles.content, {justifyContent: 'center', alignItems: 'center'}]}>
            <Text style={{fontSize: 17, color: '#999999'}}>加载用户数据失败</Text>
            <Text style={{fontSize: 17, color: '#999999', marginTop: 5}}>点击屏幕重试</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  renderDetailView() {
    return (
      <View style={styles.container}>
        <TitleBar nav={this.props.navigation}/>
        <View style={styles.divider}></View>
        <ScrollView style={styles.content}>
          <View style={{width: width, height: 20}} />
          <TouchableHighlight underlayColor={global.touchableHighlightColor} onPress={()=>{this.turnOnPage('PersonInfo', {userInfo: this.state.userInfo})}}>
            <View style={styles.meInfoContainer}>
              <Image style={styles.meInfoAvatar} source={utils.isEmpty(this.state.avatar) ? require('../../images/avatar.png') : {uri: this.state.avatar}} />
              <View style={styles.meInfoTextContainer}>
                <Text style={styles.meInfoNickName}>{this.state.username}</Text>
                <Text style={styles.meInfoWeChatId}>{"昵称：" + this.state.userInfo.name}</Text>
              </View>
              <Image style={styles.meInfoQRCode} source={require('../../images/ic_qr_code.png')} />
            </View>
          </TouchableHighlight>
          <View />
          <View style={{width: width, height: 20}} />
          <ListItem icon={require('../../images/ic_wallet.png')} text={"钱包"} />
          <View style={{width: width, height: 20}} />
          <ListItem icon={require('../../images/ic_collect.png')} text={"收藏"} showDivider={true} />
          <ListItemDivider />
          <ListItem icon={require('../../images/ic_gallery.png')} text={"相册"} showDivider={true} handleClick={()=>{this.turnOnPage('Moment')}} />
          <ListItemDivider />
          <ListItem icon={require('../../images/ic_kabao.png')} text={"卡包"} showDivider={true} handleClick={()=>{this.turnOnPage('CardPackage')}} />
          <ListItemDivider />
          <ListItem icon={require('../../images/ic_emoji.png')} text={"表情"} />
          <View style={{width: width, height: 20}} />
          <ListItem icon={require('../../images/ic_settings.png')} text={"设置"} handleClick={()=>{this.turnOnPage('Settings')}} />
          <View style={{width: width, height: 20}} />
        </ScrollView>
        <View style={styles.divider}></View>
      </View>
    );
  }
  turnOnPage(pageName, params) {
    if (utils.isEmpty(params)) {
      this.props.navigation.navigate(pageName);
    } else {
      this.props.navigation.navigate(pageName, params);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    width: width,
    height: 1 / PixelRatio.get(),
    backgroundColor: '#D3D3D3'
  },
  content: {
    flex: 1,
    width: width,
    flexDirection: 'column',
    backgroundColor: global.pageBackgroundColor,
  },
  tabBarIcon: {
    width: 24,
    height: 24,
  },
  meInfoContainer: {
    width: width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 10,
  },
  meInfoAvatar: {
    width: 60,
    height: 60,
  },
  meInfoTextContainer: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
  },
  meInfoNickName: {
    color: '#000000',
    fontSize: 16,
  },
  meInfoWeChatId: {
    color: '#999999',
    fontSize: 14,
    marginTop: 5,
  },
  meInfoQRCode: {
    width: 25,
    height: 25,
  }
});
