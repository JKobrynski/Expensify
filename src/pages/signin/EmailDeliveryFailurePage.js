import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import redirectToSignIn from '../../libs/actions/SignInRedirect';
import CONST from '../../CONST';

const propTypes = {
    /* Onyx Props */

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    credentials: {},
};

const EmailDeliveryFailurePage = (props) => {
    // Replace spaces with "hard spaces" to prevent breaking the number
    const login = Str.isSMSLogin(props.credentials.login) ? Str.removeSMSDomain(props.credentials.login) : props.credentials.login;
    return (
        <>
            <View style={[styles.mv3, styles.flexRow, styles.justifyContentetween]}>
                <View style={[styles.flex1]}>
                    <Text>{props.translate('emailDeliveryFailurePage.ourEmailProvider', {login})}</Text>
                    <Text style={[styles.mt5]}>
                        <Text style={[styles.textStrong]}>{props.translate('emailDeliveryFailurePage.confirmThat', {login})}</Text>
                        {props.translate('emailDeliveryFailurePage.emailAliases')}
                    </Text>
                    <Text style={[styles.mt5]}>
                        <Text style={[styles.textStrong]}>{props.translate('emailDeliveryFailurePage.whitelistExpensify')}</Text>
                        {props.translate('emailDeliveryFailurePage.youCanFindDirections')}
                        <TextLink
                            href="https://community.expensify.com/discussion/5651/deep-dive-best-practices-when-youre-running-into-trouble-receiving-emails-from-expensify/p1?new=1"
                            style={[styles.link]}
                        >
                            {props.translate('common.here')}
                        </TextLink>
                        {props.translate('emailDeliveryFailurePage.helpConfigure')}
                    </Text>
                    <Text style={styles.mt5}>
                        {props.translate('emailDeliveryFailurePage.onceTheAbove')}
                        <TextLink
                            href={`mailto:${CONST.EMAIL.CONCIERGE}`}
                            style={[styles.link]}
                        >
                            {CONST.EMAIL.CONCIERGE}
                        </TextLink>
                        {props.translate('emailDeliveryFailurePage.toUnblock')}
                    </Text>
                </View>
            </View>
            <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <TouchableOpacity onPress={() => redirectToSignIn()}>
                    <Text style={[styles.link]}>{props.translate('common.back')}</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

EmailDeliveryFailurePage.propTypes = propTypes;
EmailDeliveryFailurePage.defaultProps = defaultProps;
EmailDeliveryFailurePage.displayName = 'ResendValidationForm';

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(EmailDeliveryFailurePage);
