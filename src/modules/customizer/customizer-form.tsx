/* eslint-disable react/no-array-index-key */
import { AddIcon } from '@chakra-ui/icons';
import { Stack, Text, Box, Grid, Link, useToast, Button, useColorMode } from '@chakra-ui/react';
import { FieldArray, Form, Formik } from 'formik';
import * as React from 'react';
import { useLocalStorage } from 'react-use';
import { parseConfigToFormData, parseFormDataToGlobalConfig } from '../parser';
import { ControllerSelectField, FormSection, FormSectionHeader, KeybindField } from './components';
import { CustomizerClipboard, CustomizerSave, CustomizerPreview } from './forms';
import { defaultConfig, validationSchema } from './utils';
import { CheckboxField, ColorInputField, NumericField } from '~/components/form';
import { Content, Footer } from '~/components/layout';
import { CustomizerFormSettings } from '~/types/overlay';
import useHasMounted from '~/utils/use-has-mounted';
import isUnique from '~/utils/is-unique';

const CustomizerForm: React.FC = () => {
  const toast = useToast();
  const hasMounted = useHasMounted();
  const { colorMode } = useColorMode();
  const [settings, setSettings] = useLocalStorage('tmviz-settings', defaultConfig);

  const formInitialValues = React.useMemo(() => parseConfigToFormData(settings), [settings]);

  if (!hasMounted) {
    return null;
  }

  const handleSubmit = (values: CustomizerFormSettings) => {
    setSettings(parseFormDataToGlobalConfig(values));
    toast({
      description: 'Overlay settings saved.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Content as="section">
      <Box px={6} pt={8} pb={12}>
        <Formik
          enableReinitialize
          validationSchema={validationSchema}
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
        >
          {({ values }) => {
            return (
              <Form>
                <Grid gridTemplateColumns={['1fr', null, null, '1fr 1fr']} gridGap={6}>
                  <Stack spacing={6}>
                    <FormSection>
                      <FormSectionHeader title="Controller" />
                      <Box p={6}>
                        <ControllerSelectField name="config.controllerIndex" />
                      </Box>
                    </FormSection>
                    <FormSection>
                      <FormSectionHeader
                        title="Appearance"
                        subtitle="Tweak the look and feel of your overlay."
                      />
                      <Stack spacing={6} p={6}>
                        <Grid
                          gridTemplateColumns={[
                            '1fr',
                            'repeat(2, 1fr)',
                            null,
                            null,
                            'repeat(3, 1fr)',
                          ]}
                          gridGap={4}
                        >
                          <ColorInputField
                            label="Accelerator color"
                            name="appearance.accelerateColor"
                            autoComplete="off"
                          />
                          <ColorInputField
                            label="Brake color"
                            name="appearance.brakeColor"
                            autoComplete="off"
                          />
                          <ColorInputField
                            label="Steering color"
                            name="appearance.steeringColor"
                            autoComplete="off"
                          />
                        </Grid>
                        <Grid
                          gridTemplateColumns={[
                            '1fr',
                            'repeat(2, 1fr)',
                            null,
                            null,
                            'repeat(3, 1fr)',
                          ]}
                          border="1px solid"
                          borderColor={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
                          borderRadius="md"
                          gridGap={4}
                          p={4}
                        >
                          <CheckboxField
                            label="Hide accelerate"
                            name="appearance.disableAccelerate"
                          />
                          <CheckboxField label="Hide brake" name="appearance.disableBrake" />
                          <CheckboxField label="Hide steering" name="appearance.disableSteering" />
                        </Grid>
                      </Stack>
                    </FormSection>
                    <FieldArray name="keybinds">
                      {arrayHelpers => (
                        <FormSection>
                          <FormSectionHeader
                            title="Controller settings"
                            subtitle={
                              <Text fontSize="sm">
                                Use{' '}
                                <Link href="https://gamepad-tester.com/" isExternal>
                                  Gamepad Tester
                                </Link>{' '}
                                to find the values that correspond to the button you&apos;re using.
                              </Text>
                            }
                            rightElement={
                              <Button
                                type="button"
                                leftIcon={<AddIcon />}
                                onClick={() => arrayHelpers.push({ action: '', button: '' })}
                              >
                                Add Keybind
                              </Button>
                            }
                          />
                          <Box>
                            {values.keybinds && values.keybinds.length > 0
                              ? values.keybinds.map((_, index) => (
                                  <KeybindField
                                    key={index}
                                    name="keybinds"
                                    index={index}
                                    onRemove={() => arrayHelpers.remove(index)}
                                  />
                                ))
                              : null}
                            {!values.keybinds?.length && (
                              <Box px={6} py={3}>
                                <Text display="block" color="red.500" fontSize="sm">
                                  Must have at least one keybind
                                </Text>
                              </Box>
                            )}
                            {!isUnique(values.keybinds?.map(s => s.action) ?? []) && (
                              <Box px={6} py={3}>
                                <Text display="block" color="red.500" fontSize="sm">
                                  Keybinds must be unique
                                </Text>
                              </Box>
                            )}
                          </Box>
                        </FormSection>
                      )}
                    </FieldArray>
                    <FormSection>
                      <FormSectionHeader title="Advanced" />
                      <Box p={6}>
                        <NumericField
                          label="Steering deadzone"
                          name="config.steeringDeadzone"
                          autoComplete="off"
                        />
                      </Box>
                    </FormSection>
                  </Stack>
                  <Stack spacing={6}>
                    <CustomizerClipboard />
                    <Grid gridTemplateColumns={['1fr', null, null, null, '304px 1fr']} gridGap={6}>
                      <CustomizerPreview />
                      <CustomizerSave />
                    </Grid>
                  </Stack>
                </Grid>
              </Form>
            );
          }}
        </Formik>
      </Box>
      <Footer />
    </Content>
  );
};

export default CustomizerForm;
