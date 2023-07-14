import _ from 'underscore';
import React, {useState, useEffect, useRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import Popover from './Popover';
import {propTypes as popoverPropTypes, defaultProps as defaultPopoverProps} from './Popover/popoverPropTypes';
import useWindowDimensions from '../hooks/useWindowDimensions';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import CONST from '../CONST';
import styles from '../styles/styles';
import {computeHorizontalShift, computeVerticalShift} from '../styles/getPopoverWithMeasuredContentStyles';

const propTypes = {
    // All popover props except:
    // 1) anchorPosition (which is overridden for this component)
    ..._.omit(popoverPropTypes, ['anchorPosition']),

    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number.isRequired,
        vertical: PropTypes.number.isRequired,
    }).isRequired,

    /** How the popover should be aligned. The value you passed will is the part of the component that will be aligned to the
     * anchorPosition. ie: vertical:top means the top of the menu will be positioned in the anchorPosition */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /** Static dimensions for the popover.
     * Note: When passed, it will skip dimensions measuring of the popover, and provided dimensions will be used to calculate the anchor position.
     */
    popoverDimensions: PropTypes.shape({
        height: PropTypes.number,
        width: PropTypes.number,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    ...defaultPopoverProps,

    // Default positioning of the popover
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    popoverDimensions: {
        height: 0,
        width: 0,
    },
};

/**
 * This is a convenient wrapper around the regular Popover component that allows us to use a more sophisticated
 * positioning schema responsively (without having to provide a static width and height for the popover content).
 * This way, we can shift the position of popover so that the content is anchored where we want it relative to the
 * anchor position.
 */

function PopoverWithMeasuredContent(props) {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const popoverWidth = useRef(props.popoverDimensions.width);
    const popoverHeight = useRef(props.popoverDimensions.height);
    const [isContentMeasured, setIsContentMeasured] = useState(popoverWidth.current > 0 && popoverHeight.current > 0);
    const [isVisible, setIsVisible] = useState(false);

    /**
     * When Popover becomes visible, we need to recalculate the Dimensions.
     * Skip render on Popover until recalculations have done by setting isContentMeasured false as early as possible.
     */
    useEffect(() => {
        // When Popover is shown recalculate
        if (!isVisible && props.isVisible) {
            // We use additional function to guarantee that async state change would be completed
            setIsVisible(() => {
                setIsContentMeasured(lodashGet(props, 'popoverDimensions.width', 0) > 0 && lodashGet(props, 'popoverDimensions.height', 0) > 0);
                return true;
            });
        }
        if (!props.isVisible) {
            setIsVisible(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.popoverDimensions.width, props.popoverDimensions.height, props.isVisible, isVisible]);

    /**
     * Measure the size of the popover's content.
     *
     * @param {Object} nativeEvent
     */
    const measurePopover = ({nativeEvent}) => {
        popoverWidth.current = nativeEvent.layout.width;
        popoverHeight.current = nativeEvent.layout.height;
        setIsContentMeasured(true);
    };

    const adjustedAnchorPosition = useMemo(() => {
        let horizontalConstraint;
        switch (props.anchorAlignment.horizontal) {
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT:
                horizontalConstraint = {left: props.anchorPosition.horizontal - popoverWidth.current};
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER:
                horizontalConstraint = {
                    left: Math.floor(props.anchorPosition.horizontal - popoverWidth.current / 2),
                };
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT:
            default:
                horizontalConstraint = {left: props.anchorPosition.horizontal};
        }

        let verticalConstraint;
        switch (props.anchorAlignment.vertical) {
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM:
                verticalConstraint = {top: props.anchorPosition.vertical - popoverHeight.current};
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.CENTER:
                verticalConstraint = {
                    top: Math.floor(props.anchorPosition.vertical - popoverHeight.current / 2),
                };
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP:
            default:
                verticalConstraint = {top: props.anchorPosition.vertical};
        }

        return {
            ...horizontalConstraint,
            ...verticalConstraint,
        };
    }, [props.anchorPosition, props.anchorAlignment]);

    const horizontalShift = computeHorizontalShift(adjustedAnchorPosition.left, popoverWidth.current, windowWidth);
    const verticalShift = computeVerticalShift(adjustedAnchorPosition.top, popoverHeight.current, windowHeight);
    const shiftedAnchorPosition = {
        left: adjustedAnchorPosition.left + horizontalShift,
        top: adjustedAnchorPosition.top + verticalShift,
    };
    return isContentMeasured ? (
        <Popover
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            anchorPosition={shiftedAnchorPosition}
        >
            {props.children}
        </Popover>
    ) : (
        /*
            This is an invisible view used to measure the size of the popover,
            before it ever needs to be displayed.
            We do this because we need to know its dimensions in order to correctly animate the popover,
            but we can't measure its dimensions without first rendering it.
        */
        <View
            style={styles.invisible}
            onLayout={measurePopover}
        >
            {props.children}
        </View>
    );
}

PopoverWithMeasuredContent.propTypes = propTypes;
PopoverWithMeasuredContent.defaultProps = defaultProps;
PopoverWithMeasuredContent.displayName = 'PopoverWithMeasuredContent';

export default React.memo(
    withWindowDimensions(PopoverWithMeasuredContent),
    (prevProps, nextProps) =>
        (prevProps.isVisible && (nextProps.windowWidth !== prevProps.windowWidth || nextProps.windowHeight !== prevProps.windowHeight)) ||
        !_.isEqual(_.omit(prevProps, ['windowWidth', 'windowHeight']), _.omit(nextProps, ['windowWidth', 'windowHeight'])),
);
