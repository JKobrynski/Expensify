import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {OptionsPickerItem} from '@components/OptionsPicker';
import OptionsPicker from '@components/OptionsPicker';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SubscriptionDetails() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const [selectedOption, setSelectedOption] = React.useState<string>(privateSubscription?.type ?? CONST.SUBSCRIPTION.TYPE.ANNUAL);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const options: OptionsPickerItem[] = [
        {
            key: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            title: translate('subscription.details.annual'),
            icon: Illustrations.SubscriptionAnnual,
        },
        {
            key: CONST.SUBSCRIPTION.TYPE.PAYPERUSE,
            title: translate('subscription.details.payPerUse'),
            icon: Illustrations.SubscriptionPPU,
        },
    ];

    const onOptionSelected = (option: string) => {
        setSelectedOption(option);
    };

    // This section is only shown when the subscription is annual
    let subscriptionSizeSection = null;

    if (privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL) {
        subscriptionSizeSection = privateSubscription?.userCount ? (
            <MenuItemWithTopDescription
                description={translate('subscription.details.subscriptionSize')}
                title={`${privateSubscription?.userCount}`}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                style={styles.mt5}
            />
        ) : (
            <>
                <MenuItemWithTopDescription
                    description={translate('subscription.details.subscriptionSize')}
                    shouldShowRightIcon
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    style={styles.mt5}
                />
                <Text style={styles.mt2}>
                    <Text style={styles.h4}>{translate('subscription.details.headsUpTitle')}</Text>
                    <Text style={styles.textLabelSupporting}>{translate('subscription.details.headsUpBody')}</Text>
                </Text>
            </>
        );
    }

    return (
        <Section
            title={translate('subscription.details.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
            {account?.isApprovedAccountant || account?.isApprovedAccountantClient ? (
                <View style={[styles.borderedContentCard, styles.p5, styles.mt5]}>
                    <Icon
                        src={Illustrations.ExpensifyApprovedLogo}
                        width={variables.modalTopIconWidth}
                        height={variables.menuIconSize}
                    />
                    <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('subscription.details.zeroCommitment')}</Text>
                </View>
            ) : (
                <>
                    <OptionsPicker
                        options={options}
                        selectedOption={selectedOption}
                        onOptionSelected={onOptionSelected}
                        style={styles.mt5}
                    />
                    {subscriptionSizeSection}
                </>
            )}
        </Section>
    );
}

export default SubscriptionDetails;