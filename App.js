import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Dimensions,
  TouchableNativeFeedback,
} from 'react-native';
import {Icon, Image} from 'react-native-elements';
import ImagePicker from 'react-native-image-picker';
import {ActivityIndicator} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

const App = () => {
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const selectImage = () => {
    if (analyzing) {
      return;
    }
    ImagePicker.showImagePicker({}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const {fileName, type, uri, path} = response;
        setPhoto({
          name: fileName,
          type,
          uri,
          path,
        });
        setResult(null);
      }
    });
  };
  const fetchResults = () => {
    return RNFetchBlob.fetch(
      'POST',
      'http://192.168.43.159:5000/test',
      {
        'content-type': 'multipart/form-data',
        accept: 'application/json',
      },
      [
        {
          name: 'testImage',
          data: RNFetchBlob.wrap(photo.uri),
          type: 'image/jpeg',
          filename: photo.name,
        },
      ],
    )
      .then(res => {
        return res.json();
      })
      .catch(err => {
        return err;
      });
  };
  const analyze = () => {
    setAnalyzing(true);
    setResult(null);
    fetchResults()
      .then(data => {
        setResult(data);
        console.log(data);
        setAnalyzing(false);
      })
      .catch(err => {
        setResult(null);
        setAnalyzing(false);
        throw err;
      });
  };
  return (
    <>
      <View style={styles.main}>
        {!photo && <SelectImage onSelect={setPhoto} />}
        {photo && (
          <>
            <TouchableOpacity onPress={selectImage}>
              <Image
                style={styles.img}
                source={{uri: photo.uri}}
                PlaceholderContent={<ActivityIndicator />}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.actionBtns}>
              <Button
                title={analyzing ? 'Analyzing...' : 'Analyze'}
                disabled={analyzing}
                onPress={analyze}
              />
            </View>
            {analyzing && <ActivityIndicator color="#3566FF" size="large" />}
            {result && (
              <View style={styles.result}>
                <Text style={styles.resultText}>Result: {result.label}</Text>
                <Text style={styles.resultText}>
                  Confidence: {result.accuracy}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </>
  );
};

const CameraButton = ({onSelect}) => {
  const selectImage = () => {
    ImagePicker.showImagePicker({}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const {fileName, type, uri, path} = response;
        onSelect({
          name: fileName,
          type,
          uri,
          path,
        });
      }
    });
  };
  return (
    <TouchableOpacity onPress={selectImage}>
      <View>
        <Icon name="image" size={90} type="evilicon" />
      </View>
    </TouchableOpacity>
  );
};

const SelectImage = ({onSelect}) => {
  return (
    <View>
      <CameraButton onSelect={onSelect} />
      <Text>Touch to select an image</Text>
    </View>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    width: '100%',
    height: '100%',
  },
  img: {
    overflow: 'visible',
    width: width * 0.9,
    height: width * 0.9,
  },
  actionBtns: {
    paddingTop: 10,
    paddingBottom: 15,
  },
  result: {
    width: '90%',
  },
  resultText: {
    paddingVertical: 5,
    backgroundColor: 'green',
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    textTransform: 'capitalize',
    elevation: 5,
  },
});

export default App;
